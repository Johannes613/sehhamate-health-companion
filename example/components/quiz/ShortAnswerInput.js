import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { PaperPlaneRight } from 'phosphor-react-native';

export const ShortAnswerInput = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Write your answer here..."
        placeholderTextColor="#6C757D"
        multiline
        value={text}
        onChangeText={setText}
        editable={!isLoading}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#8A63D2" />
        ) : (
          <PaperPlaneRight color="#FFFFFF" size={22} weight="fill" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F6F7',
    color: '#212529',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5F6F7',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#8A63D2',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
});
