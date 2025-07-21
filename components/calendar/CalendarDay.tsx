import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

interface CalendarDayProps {
  day: string;
  today: boolean;
  offer: boolean;
  order: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  width: number;
  onPress: () => void;
}

export default function CalendarDay({
  day,
  today,
  offer,
  order,
  isCurrentMonth,
  isSelected,
  width,
  onPress,
}: CalendarDayProps) {
  const primaryColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const selectedTextColor = useThemeColor({ dark: "dark" }, "text");

  return (
    <View
      style={{
        width: width / 7,
        padding: 1,
      }}
    >
      <Pressable
        style={[
          styles.touchableBox,
          { backgroundColor: backgroundColor },
          !offer && isCurrentMonth && styles.noOfferDay,
          !isCurrentMonth && styles.otherMonthDay,
          today &&
            isCurrentMonth && {
              ...styles.todayBackground,
              borderColor: primaryColor,
            },
          isSelected && {
            ...styles.selectedDay,
            backgroundColor: primaryColor,
          },
        ]}
        onPress={onPress}
        disabled={!isCurrentMonth}
      >
        <View style={styles.dayBox}>
          {isCurrentMonth && (
            <ThemedText
              style={[
                styles.dayText,
                { color: textColor },
                today && { fontWeight: "bold", color: primaryColor },
                isSelected && { color: selectedTextColor, fontWeight: "bold" },
              ]}
            >
              {day}
            </ThemedText>
          )}
          {/* Status indicators */}
          {order && isCurrentMonth && (
            <View style={[styles.status, styles.ordered]}>
              <ThemedText style={styles.orderedText}></ThemedText>
            </View>
          )}

          {offer && isCurrentMonth && !order && (
            <View style={[styles.status, styles.available]}>
              <ThemedText style={styles.orderedText}></ThemedText>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  touchableBox: {
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
  },
  dayBox: {
    justifyContent: "center",
    marginHorizontal: 0,
    position: "relative",
  },
  dayText: {
    textAlign: "center",
    fontSize: 13,
  },
  status: {
    position: "absolute",
    borderRadius: 5,
    width: 8,
    height: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ordered: {
    top: 2,
    right: 2,
    backgroundColor: "#ffaa2a",
  },
  available: {
    bottom: 2,
    right: 2,
    backgroundColor: "#0070ff",
  },
  orderedText: {
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  selectedDay: {
    borderWidth: 2,
  },
  todayBackground: {
    borderWidth: 2,
    borderRadius: 4,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  noOfferDay: {
    opacity: 0.4,
  },
});
