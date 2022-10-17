import React, { useState } from "react";
import { View } from "react-native";

import { BrandText } from "../../components/BrandText/BrandText";
import { useAppNavigation, getCurrentRouteName } from "../../utils/navigation";

export const NavBarGovernance: React.FC<{
  visible?: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const navigation = useAppNavigation();

  const currentPage = getCurrentRouteName(navigation);

  const [activeAllPeriod] = useState(currentPage === "AllPeriods");
  const [activeVoting] = useState(currentPage === "Voting");
  const [activePassed] = useState(currentPage === "Passed");
  const [activeRejected] = useState(currentPage === "Rejected");

  return (
    <View
      style={{
        top: 15,
        display: "flex",
        flexWrap: "wrap",
        alignContent: "center",
        justifyContent: "space-between",
        width: "fit-content",
        borderWidth: 0.5,
        borderColor: "#808080",
        flexDirection: "row",
        borderRadius: 20,
        height: 32,
      }}
    >
      <a
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigation.navigate("AllPeriods");
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: activeAllPeriod ? "#16BBFF" : "black",
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: 18,
          }}
        >
          <BrandText
            style={{
              color: activeAllPeriod ? "black" : "white",
              fontSize: 14,
              width: 85,
              height: 32,
              textAlign: "center",
              position: "relative",
              top: 6,
            }}
          >
            All period
          </BrandText>
          <View
            style={{
              width: 32,
              height: 0,
              borderWidth: 0.5,
              borderColor: "#808080",
              transform: [{ rotate: "90deg" }],
              position: "absolute",
              top: 16,
              left: 69,
            }}
          />
        </View>
      </a>

      <a
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigation.navigate("Voting");
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: activeVoting ? "#16BBFF" : "black",
          }}
        >
          <BrandText
            style={{
              color: activeVoting ? "black" : "white",
              fontSize: 14,
              width: 80,
              height: 32,
              textAlign: "center",
              position: "relative",
              top: 6,
            }}
          >
            Voting
          </BrandText>
          <View
            style={{
              width: 32,
              height: 0,
              borderWidth: 0.5,
              borderColor: "#808080",
              transform: [{ rotate: "90deg" }],
              position: "absolute",
              top: 16,
              left: 64,
            }}
          />
        </View>
      </a>

      <a
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigation.navigate("Passed");
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: activePassed ? "#16BBFF" : "black",
            // borderTopRightRadius: 18,
            // borderBottomRightRadius: 18,
          }}
        >
          <BrandText
            style={{
              color: activePassed ? "black" : "white",
              fontSize: 14,
              width: 80,
              height: 32,
              textAlign: "center",
              position: "relative",
              top: 6,
            }}
          >
            Passed
          </BrandText>
          <View
            style={{
              width: 32,
              height: 0,
              borderWidth: 0.5,
              borderColor: "#808080",
              transform: [{ rotate: "90deg" }],
              position: "absolute",
              top: 16,
              left: 64,
            }}
          />
        </View>
      </a>

      <a
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigation.navigate("Rejected");
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            backgroundColor: activeRejected ? "#16BBFF" : "black",
            borderTopRightRadius: 18,
            borderBottomRightRadius: 18,
          }}
        >
          <BrandText
            style={{
              color: activeRejected ? "black" : "white",
              fontSize: 14,
              width: 80,
              height: 32,
              textAlign: "center",
              borderTopRightRadius: 18,
              borderBottomRightRadius: 18,
              position: "relative",
              top: 6,
            }}
          >
            Rejected
          </BrandText>
        </View>
      </a>
    </View>
  );
};
