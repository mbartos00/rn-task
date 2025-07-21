import { useThemeColor } from "@/hooks/useThemeColor";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import spacetime, { Spacetime } from "spacetime";
import { ThemedText } from "../ThemedText";
import CalendarDay from "./CalendarDay";

export interface WeekViewProps {
  from: Spacetime;
  offerDays: string[];
  orderDays: string[];
}

export interface MonthDay {
  day: string;
  date: string;
  today: boolean;
  offer: boolean;
  order: boolean;
  isCurrentMonth: boolean;
}

export const DayFormat = "YYYY-MM-DD";

export default function MonthView({
  from,
  orderDays,
  offerDays,
}: WeekViewProps) {
  const [width, setWidth] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Spacetime>(spacetime(from));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const monthStart = currentDate.startOf("month");
  const monthEnd = currentDate.endOf("month");

  const firstDayOfMonth = monthStart.clone();
  const firstMonday = firstDayOfMonth.day("monday");

  if (firstMonday.isAfter(firstDayOfMonth)) {
    firstMonday.subtract(7, "days");
  }

  const lastDayOfMonth = monthEnd.clone();
  const lastSunday = lastDayOfMonth.day("sunday");

  if (lastSunday.isBefore(lastDayOfMonth)) {
    lastSunday.add(7, "days");
  }

  const days: MonthDay[] = [];
  let currentDay = firstMonday.clone();

  while (
    currentDay.isBefore(lastSunday) ||
    currentDay.isSame(lastSunday, "day")
  ) {
    const dateString = currentDay.format("iso-short");

    days.push({
      day: currentDay.format("{date}").padStart(2, "0"),
      date: dateString,
      today: currentDay.isSame(spacetime.now(), "day"),
      offer: offerDays.includes(dateString),
      order: orderDays.includes(dateString),
      isCurrentMonth: currentDay.isSame(currentDate, "month"),
    });

    currentDay = currentDay.add(1, "day");
  }

  const weeks: MonthDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
    setSelectedDay(null);
  };

  const selectDay = (dayData: MonthDay) => {
    if (!dayData.offer) return;

    if (dayData.isCurrentMonth) {
      setSelectedDay(dayData.date === selectedDay ? null : dayData.date);
    }
  };

  const handleOrder = async () => {
    if (!selectedDay) return;

    try {
      const response = await fetch("https://example.com/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDay,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Success",
          `Order placed for ${spacetime(selectedDay).format(
            "{month-name} {date}, {year}"
          )}`
        );
        setSelectedDay(null);
      } else {
        Alert.alert("Error", "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network error. Please check your connection.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Month/Year header with navigation */}
      <View style={[styles.monthHeader, { backgroundColor }]}>
        <Pressable
          style={[styles.navButton, { backgroundColor: backgroundColor }]}
          onPress={goToPreviousMonth}
        >
          <ThemedText style={styles.navButtonText}>‹</ThemedText>
        </Pressable>

        <View style={styles.monthYearContainer}>
          <ThemedText style={[styles.monthYearText, { color: textColor }]}>
            {currentDate.format("{month-name} {year}")}
          </ThemedText>
        </View>

        <Pressable
          style={[styles.navButton, { backgroundColor: backgroundColor }]}
          onPress={goToNextMonth}
        >
          <ThemedText style={styles.navButtonText}>›</ThemedText>
        </Pressable>
      </View>

      <View
        style={styles.days}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {/* Week day header */}
        <View style={styles.weekHeader}>
          {weekDayNames.map((dayName) => (
            <View
              key={dayName}
              style={{
                width: width / 7,
                padding: 2,
              }}
            >
              <ThemedText style={styles.weekDayName}>{dayName[0]}</ThemedText>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View
            key={`week-${week[0]?.date || weekIndex}`}
            style={styles.weekRow}
          >
            {week.map((d) => (
              <CalendarDay
                key={d.date}
                day={d.day}
                today={d.today}
                offer={d.offer}
                order={d.order}
                isCurrentMonth={d.isCurrentMonth}
                isSelected={selectedDay === d.date}
                width={width}
                onPress={() => selectDay(d)}
              />
            ))}
          </View>
        ))}
        {/* Selected day details */}
        {selectedDay && (
          <View style={[styles.selectedDayDetails, { backgroundColor }]}>
            <ThemedText style={[styles.selectedDayText, { color: textColor }]}>
              Selected:{" "}
              {spacetime(selectedDay).format("{month-name} {date}, {year}")}
            </ThemedText>
            <Pressable
              style={[styles.orderButton, { backgroundColor: backgroundColor }]}
              onPress={handleOrder}
            >
              <ThemedText style={styles.orderButtonText}>Order</ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  monthYearContainer: {
    flex: 1,
    alignItems: "center",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedDayDetails: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  selectedDayText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  orderButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff",
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  days: {
    marginVertical: 2,
    marginHorizontal: 2,
    alignSelf: "stretch",
  },
  weekHeader: {
    flexDirection: "row",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekDayName: {
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 10,
  },
});
