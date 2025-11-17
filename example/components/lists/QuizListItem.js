import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Exam, CaretRight } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";

const QuizListItem = ({
  id,
  title,
  questionCount = 0,
  isSuggested = false,
  isPersonalized = false,
  isMock = false,
  onPress,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) return onPress();
    navigation.navigate("Quiz", {
      quizId: id,
      isPersonalized: isPersonalized,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <LinearGradient
        colors={isSuggested ? ["#8A63D2", "#7B5BC7"] : ["#DEE2E6", "#E9ECEF"]}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>
          <Exam color={isSuggested ? "#FFFFFF" : "#8A63D2"} size={26} weight="bold" />
        </View>
        <View style={styles.details}>
          {(isSuggested || isMock) && (
            <Text style={styles.suggestedText}>
              {isMock ? "Personalized (Tap to generate)" : "Suggested from CyberSense AI"}
            </Text>
          )}

          <Text style={[styles.title, isSuggested && styles.suggestedTitle]}>{title}</Text>
          <Text style={[styles.questionCount, isSuggested && styles.suggestedQuestionCount]}>
            {questionCount} Questions
          </Text>
        </View>
        <CaretRight color={isSuggested ? "#FFFFFF" : "#6C757D"} size={22} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  iconContainer: {
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  suggestedText: {
    color: "#E0CFFC",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    color: "#212529",
    fontSize: 17,
    fontWeight: "bold",
  },
  suggestedTitle: {
    color: "#FFFFFF",
  },
  questionCount: {
    color: "#6C757D",
    fontSize: 14,
    marginTop: 4,
  },
  suggestedQuestionCount: {
    color: "#E0CFFC",
  },
});

export default QuizListItem;
