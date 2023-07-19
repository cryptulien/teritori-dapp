package indexerhandler

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	wasmtypes "github.com/CosmWasm/wasmd/x/wasm/types"
	"github.com/TERITORI/teritori-dapp/go/internal/indexerdb"
	"github.com/TERITORI/teritori-dapp/go/pkg/networks"
	"github.com/google/uuid"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

type Reaction struct {
	Identifier string `json:"identifier"`
	Icon       string `json:"icon"`
}

type CreatePostMsg struct {
	Identifier           string `json:"identifier"`
	ParentPostIdentifier string `json:"parent_post_identifier"`
	Category             uint32 `json:"category"`
	Metadata             string `json:"metadata"`
}

type TipPostMsg struct {
	Identifier string `json:"identifier"`
}

type ExecTipPostMsg struct {
	TipPost TipPostMsg `json:"tip_post"`
}

type ExecCreatePostMsg struct {
	CreatePost CreatePostMsg `json:"create_post"`
}

type ExecCreatePostByBotMsg struct {
	CreatePostByBot CreatePostMsg `json:"create_post_by_bot"`
}

type ReactPostMsg struct {
	Identifier string `json:"identifier"`
	Icon       string `json:"icon"`
	Up         bool   `json:"up"`
}

type ExecReactPostMsg struct {
	ReactPost ReactPostMsg `json:"react_post"`
}

type DeletePostMsg struct {
	Identifier string `json:"identifier"`
}

type ExecDeletePostMsg struct {
	DeletePost DeletePostMsg `json:"delete_post"`
}

func removeUserFromList(users []networks.UserID, user networks.UserID) []networks.UserID {
	res := make([]networks.UserID, 0)
	for _, userInList := range users {
		if userInList != user {
			res = append(res, userInList)
		}
	}
	return res
}

func (h *Handler) handleExecuteDeletePost(e *Message, execMsg *wasmtypes.MsgExecuteContract) error {
	var execDeletePostMsg ExecDeletePostMsg
	if err := json.Unmarshal(execMsg.Msg, &execDeletePostMsg); err != nil {
		return errors.Wrap(err, "failed to unmarshal execute delete post msg")
	}

	deletePost := execDeletePostMsg.DeletePost

	post := indexerdb.Post{}
	if err := h.db.Where("identifier = ?", deletePost.Identifier).First(&post).Error; err != nil {
		return errors.Wrap(err, "failed to get post to delete")
	}

	post.IsDeleted = true

	if err := h.db.Save(&post).Error; err != nil {
		return errors.Wrap(err, "failed to set deleted to post")
	}

	return nil
}

func (h *Handler) handleExecuteReactPost(e *Message, execMsg *wasmtypes.MsgExecuteContract) error {
	var execReactPostMsg ExecReactPostMsg
	if err := json.Unmarshal(execMsg.Msg, &execReactPostMsg); err != nil {
		return errors.Wrap(err, "failed to unmarshal execute react post msg")
	}

	reactPost := execReactPostMsg.ReactPost

	post := indexerdb.Post{}
	if err := h.db.Where("identifier = ?", reactPost.Identifier).First(&post).Error; err != nil {
		return errors.Wrap(err, "failed to get post to react")
	}

	userReactions := post.UserReactions
	var users []networks.UserID
	reactedUsers, found := userReactions[reactPost.Icon]
	if found {
		for _, user := range reactedUsers.([]interface{}) {
			users = append(users, networks.UserID(user.(string)))
		}

	} else {
		users = make([]networks.UserID, 0)
	}
	newReactedUser := h.config.Network.UserID(execMsg.Sender)

	// Smartcontract has validated already data so we do not need to re-validate
	// just add user to list if up == True otherwise remove user
	if reactPost.Up {
		users = append(users, newReactedUser)
	} else {
		users = removeUserFromList(users, newReactedUser)
	}
	if len(users) == 0 {
		delete(userReactions, reactPost.Icon)
	} else {
		userReactions[reactPost.Icon] = users
	}

	post.UserReactions = userReactions

	if err := h.db.Save(&post).Error; err != nil {
		return errors.Wrap(err, "failed to update reactions")
	}

	return nil
}

func (h *Handler) handleExecuteCreatePost(e *Message, execMsg *wasmtypes.MsgExecuteContract) error {
	if execMsg.Contract != h.config.Network.SocialFeedContractAddress {
		h.logger.Debug("ignored create post for unknown contract", zap.String("tx", e.TxHash), zap.String("contract", execMsg.Contract))
		return nil
	}

	var execCreatePostMsg ExecCreatePostMsg
	if err := json.Unmarshal(execMsg.Msg, &execCreatePostMsg); err != nil {
		return errors.Wrap(err, "failed to unmarshal execute create post msg")
	}

	return h.createPost(e, execMsg, &execCreatePostMsg.CreatePost)
}

func (h *Handler) createPost(
	e *Message,
	execMsg *wasmtypes.MsgExecuteContract,
	createPostMsg *CreatePostMsg,
) error {
	var metadataJSON map[string]interface{}
	if err := json.Unmarshal([]byte(createPostMsg.Metadata), &metadataJSON); err != nil {
		return errors.Wrap(err, "failed to unmarshal metadata")
	}

	createdAt, err := e.GetBlockTime()
	if err != nil {
		return errors.Wrap(err, "failed to get block time")
	}
	message, ok := metadataJSON["message"].(string)
	if !ok {
		return errors.Wrap(err, "failed to get message")
	}
	//check question
	if strings.Contains(message, "?") {
		err1 := h.createAIAnswer(e, metadataJSON, createPostMsg) //store AI's answer to indexer db
		if err1 != nil {
			return errors.Wrap(err, "failed to generate answer using AI")
		}
	}

	post := indexerdb.Post{
		Identifier:           createPostMsg.Identifier,
		ParentPostIdentifier: createPostMsg.ParentPostIdentifier,
		Category:             createPostMsg.Category,
		Metadata:             metadataJSON,
		UserReactions:        map[string]interface{}{},
		CreatedBy:            h.config.Network.UserID(execMsg.Sender),
		CreatedAt:            createdAt.Unix(),
		IsBot:                false,
	}

	if err := h.db.Create(&post).Error; err != nil {
		return errors.Wrap(err, "failed to create post")
	}

	h.handleQuests(execMsg, createPostMsg)

	return nil
}

type CreateCompletionsRequest struct {
	Model       string  `json:"model,omitempty"`
	Prompt      string  `json:"prompt,omitempty"`
	Temperature float64 `json:"temperature,omitempty"`
}

type CreateCompletionsResponse struct {
	Choices []struct {
		Text string `json:"text,omitempty"`
	} `json:"choices,omitempty"`
	Error Error `json:"error,omitempty"`
}
type Error struct {
	Message string      `json:"message,omitempty"`
	Type    string      `json:"type,omitempty"`
	Param   interface{} `json:"param,omitempty"`
	Code    interface{} `json:"code,omitempty"`
}

func (h *Handler) createAIAnswer(e *Message, metadata map[string]interface{}, createPostMsg *CreatePostMsg) error {
	apiKey := h.config.ChatApiKey
	url := "https://api.openai.com/v1/completions"
	response := make([]byte, 0)
	question, _ := metadata["message"].(string)
	input := CreateCompletionsRequest{
		Model:       "text-davinci-003",
		Prompt:      question,
		Temperature: 0.7,
	}
	rJson, err := json.Marshal(input)
	if err != nil {
		return err
	}
	body := bytes.NewReader(rJson)
	req1, err1 := http.NewRequest(http.MethodPost, url, body)
	if err != nil {
		return err1
	}

	req1.Header.Add("Authorization", "Bearer "+apiKey)
	req1.Header.Add("Content-Type", "application/json")
	client := &http.Client{}
	resp, err2 := client.Do(req1)
	if err2 != nil {
		return err2
	}
	defer resp.Body.Close()
	response, err3 := io.ReadAll(resp.Body)
	if err3 != nil {
		return err3
	}
	res3 := CreateCompletionsResponse{}
	err = json.Unmarshal(response, &res3)
	if err != nil {
		return err
	}
	if res3.Error.Message != "" {
		return errors.New(res3.Error.Message)
	}
	answer := res3.Choices[0].Text

	createdAt, err4 := e.GetBlockTime()
	if err != nil {
		return errors.Wrap(err4, "failed to get block time")
	}
	u := uuid.New()
	metadata["message"] = answer
	post := indexerdb.Post{
		Identifier:           u.String(),
		ParentPostIdentifier: createPostMsg.Identifier,
		Category:             1, //Comment
		Metadata:             metadata,
		UserReactions:        map[string]interface{}{},
		CreatedBy:            "",
		CreatedAt:            createdAt.Unix(),
		IsBot:                true,
	}

	if err := h.db.Create(&post).Error; err != nil {
		return errors.Wrap(err, "failed to create post")
	}
	return nil
}

func (h *Handler) handleExecuteTipPost(e *Message, execMsg *wasmtypes.MsgExecuteContract) error {
	var execTipPostMsg ExecTipPostMsg
	if err := json.Unmarshal(execMsg.Msg, &execTipPostMsg); err != nil {
		return errors.Wrap(err, "failed to unmarshal execute tip post msg")
	}

	post := indexerdb.Post{
		Identifier: execTipPostMsg.TipPost.Identifier,
	}

	if err := h.db.First(&post).Error; err != nil {
		return errors.Wrap(err, "post not found")
	}

	post.TipAmount += execMsg.Funds[0].Amount.Int64()
	h.db.Save(&post)

	if err := h.db.Save(&post).Error; err != nil {
		return errors.Wrap(err, "failed to update tip amount")
	}

	// complete social_feed_tip_content_creator quest
	if err := h.db.Save(&indexerdb.QuestCompletion{
		UserID:    h.config.Network.UserID(execMsg.Sender),
		QuestID:   "social_feed_tip_content_creator",
		Completed: true,
	}).Error; err != nil {
		return errors.Wrap(err, "failed to save social_feed_tip_content_creator quest completion")
	}
	return nil
}

func (h *Handler) handleQuests(
	execMsg *wasmtypes.MsgExecuteContract,
	createPostMsg *CreatePostMsg,
) error {
	questId := "unknown"
	switch createPostMsg.Category {
	case 1:
		questId = "social_feed_first_comment"
	case 2:
		questId = "social_feed_first_post"
	case 3:
		questId = "social_feed_first_article"
	case 4:
		questId = "social_feed_first_picture"
	case 5:
		questId = "social_feed_first_audio"
	case 6:
		questId = "social_feed_first_video"
	case 7:
		questId = "social_feed_first_ai_generation"
	default:
		questId = "unknown"
	}

	if questId != "unknown" {
		if err := h.db.Save(&indexerdb.QuestCompletion{
			UserID:    h.config.Network.UserID(execMsg.Sender),
			QuestID:   questId,
			Completed: true,
		}).Error; err != nil {
			return errors.Wrap(err, "failed to save quest completion")
		}
	}

	return nil
}
