import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { deleteDoc, doc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { firestoreDB } from '../config/firebase.config';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import AppText from '@/components/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

const DetailsScreen = ({ route }) => {
  const { post } = route.params;
  const user = useSelector((state) => state.user.user);
  const [isUserPosted, setIsUserPosted] = useState(post.User._id === user._id);
  const room_id = `${user._id}-${post._id}`;
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [COSavailable, setCOSavailable] = useState(false)
const [Aboutavailable, setAboutavailable] = useState(false)
const [isProfileComplete, setIsProfileComplete] = useState(false);


  const navigation = useNavigation();
  const identifier =  `${user._id}-${post.User._id}-${post._id}`;

  useEffect(() => {
    const checkIfApplied = async () => {
      const chatQuery = query(
        collection(firestoreDB, 'chats'),
        where('idRoom', '==', room_id)
      );

      const querySnapshot = await getDocs(chatQuery);
      if (!querySnapshot.empty) {
        setHasApplied(true);
      }
    };

    checkIfApplied();
  }, [user._id, room_id]);

  useEffect(() => {
    const msgQuery = query(collection(firestoreDB, 'users', user._id, 'details'));
    const unsubscribe = onSnapshot(msgQuery, (querySnapshot) => {
      const upMsg = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      const hasCOS = upMsg.length > 0 && upMsg[0].Hostel;
      const hasAbout = upMsg.length > 0 && upMsg[0].About;
  
      if (hasCOS && hasAbout) {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
    });
  
    return unsubscribe;
  }, [user._id]);
  
  const othersideview = async () => {
    const newid = `${post.User._id}-${Date.now()}`;

    const _doc1 = {
      index: post.User._id,
      _id: newid,
      user: user,
      chatName: post.User.fullName,
      jobName: post.JobDetails,
      profilePic: post.User.profilePic,
      idRoom: room_id,
      index1: user._id,
      price:post.Budget
    };

    try {
      await setDoc(doc(firestoreDB, "chats", newid), _doc1);
      navigation.navigate("Homescreen", { post: post });
      setIsApplying(false);

      Toast.show({
  type: ALERT_TYPE.SUCCESS,
  title: 'Application Sent',
  textBody:post.User.fullName + ' has been added to chats',
});

    } catch (err) {

    }
  }

  const removePost = async (postIdToRemove) => {
    setIsApplying(true);
    try {
      await deleteDoc(doc(firestoreDB, 'postings', postIdToRemove));
       Toast.show({
              type: ALERT_TYPE.SUCCESS,
              title: 'Post Removed',
              textBody: 'The post has been successfully removed.',
            });
      navigation.navigate("Homescreen");
    } catch (error) {
      console.error('Error removing document: ', error);
    }
  };

  const createNewChat = async () => {
    setIsApplying(true);

    if (!isProfileComplete ) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Incomplete Profile',
        textBody: 'Please finish setting up your profile before applying.',
      });
      setIsApplying(false);
      return;
    }

    const chatQuery = query(
      collection(firestoreDB, 'chats'),
      where('idRoom', '==', room_id)
    );

    const querySnapshot = await getDocs(chatQuery);
    if (!querySnapshot.empty) {
      setIsApplying(false);
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Already Applied',
        textBody: 'You have already applied for this job.',
      });
      return;
    }

  

    const id = `${user._id}-${Date.now()}`;

    const _doc = {
      index: user._id,
      _id: id,
      user: post.User,
      chatName: post.User.fullName,
      jobName: post.JobDetails,
      idRoom: room_id,
      index1: user._id,
      price:post.Budget,
    };

    try {
      await setDoc(doc(firestoreDB, "chats", id), _doc);
      
      othersideview();
    } catch (err) {
      setIsApplying(false);
      Toast.show({
        type: ALERT_TYPE.ERROR,
        title: 'Error',
        textBody: 'Failed to create chat.',
      });
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return '';
    return budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fdfdfd' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 20 }}>
            <MaterialIcons name='chevron-left' size={32} color="#000" />
          </TouchableOpacity>
          <AppText style={{ fontSize: 24, fontWeight: '700', color: '#000' }}>Job Details</AppText>
        </View>

        {/* Profile */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Image source={{ uri: post.User.profilePic }} resizeMode="cover" style={{ width: 160, height: 160, borderRadius: 80, borderWidth: 3, borderColor: '#268290' }} />
          <AppText style={{ fontSize: 20, fontWeight: '600', marginTop: 12, color: '#111' }}>{post.User.fullName}</AppText>
        </View>

        {/* Job Info Card */}
        <View style={{ margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 8 }, shadowRadius: 15, elevation: 5 }}>
          <AppText style={{ fontSize: 22, fontWeight: '600', color: '#268290', marginBottom: 8 }}>{post.JobDetails}</AppText>
          <AppText style={{ fontSize: 16, color: '#555', lineHeight: 24 }}>{post.Description}</AppText>

          {/* Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name='location-on' size={26} color="#268290" />
              <AppText style={{ fontSize: 14, fontWeight: '500', color: '#268290', marginTop: 4 }}>{post.Location}</AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name='calendar-month' size={26} color="#268290" />
              <AppText style={{ fontSize: 14, fontWeight: '500', color: '#268290', marginTop: 4 }}>{post.DisplayTime}</AppText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <AppText style={{ fontSize: 24, fontWeight: '700', color: '#268290' }}>₦</AppText>
              <AppText style={{ fontSize: 14, fontWeight: '500', color: '#268290', marginTop: 4 }}>{formatBudget(post.Budget)}</AppText>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {!isUserPosted ? (
          hasApplied ? (
            <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: '#d1d5db', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Already Applied</AppText>
            </View>
          ) : (
            <TouchableOpacity
              disabled={isApplying}
              onPress={createNewChat}
              style={{
                marginHorizontal: 20,
                marginTop: 20,
                backgroundColor: '#268290',
                paddingVertical: 16,
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: '#268290',
                shadowOpacity: 0.4,
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 15,
                elevation: 8,
              }}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AppText style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Apply Now</AppText>
              )}
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            disabled={isApplying}
            onPress={() => removePost(post.id)}
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              backgroundColor: '#ef4444',
              paddingVertical: 16,
              borderRadius: 20,
              alignItems: 'center',
              shadowColor: '#ef4444',
              shadowOpacity: 0.4,
              shadowOffset: { width: 0, height: 8 },
              shadowRadius: 15,
              elevation: 8,
            }}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Remove Job</AppText>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailsScreen;
