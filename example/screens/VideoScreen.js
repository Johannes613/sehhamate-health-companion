import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ui/ScreenContainer';
import { ScreenHeaderWithBack } from '../components/ui/ScreenHeaderWithBack';
import { PlayCircle } from 'phosphor-react-native';

const VideoPlayerPlaceholder = () => (
  <View style={videoStyles.playerContainer}>
            <PlayCircle color="#8A63D2" size={60} weight="fill" style={{ opacity: 0.8 }} />
    <Text style={videoStyles.playerText}>Video Player Placeholder</Text>
  </View>
);

const VideoScreen = ({ navigation, route }) => {
  return (
    <ScreenContainer>
      <ScreenHeaderWithBack title="Introduction to the Internet" navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={videoStyles.description}>
          Please watch the following video. This presents the basic introduction of internet.
        </Text>
        <VideoPlayerPlaceholder />
        <Text style={videoStyles.thanksText}>
          Thanks for watching, please complete the following quiz to test your understanding.
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Quiz')}>
           <Text style={videoStyles.quizLink}>Go to Quiz: Introduction to the Internet</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const videoStyles = StyleSheet.create({
  description: { color: '#6C757D', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  playerContainer: {
    backgroundColor: '#F5F6F7',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  playerText: { color: '#6C757D', marginTop: 10 },
  thanksText: { color: '#212529', fontSize: 16, lineHeight: 24, marginBottom: 16, textAlign: 'center' },
  quizLink: { color: '#8A63D2', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});

export default VideoScreen;