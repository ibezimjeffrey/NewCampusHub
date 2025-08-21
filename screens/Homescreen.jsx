import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {AddTochatscreen, ClientHomescreen, Messagescreen, Postscreen, Profilescreen, Searchscreen} from './index.js';
import Ionicons from 'react-native-vector-icons/Ionicons'; 


function Home() {
  return (
  <ClientHomescreen/>
  );
}

function Search() {
  return (
   
    <Searchscreen/>
  );
}

function Post() {
  return (
    <Postscreen/>
  );
}

function Messages() {
  return (
  <Messagescreen/>
  );
}

function Profile() {
  return (
 <Profilescreen/>
  );
}


function Chat() {
  return (
 <AddTochatscreen/>
  );
}

const Tab = createBottomTabNavigator();

const Homescreen = () => {
  return (
  
      <Tab.Navigator 
        screenOptions={({ route } ) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Post') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Messages') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            }
            else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person';
            }

      
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: '#268290',
          inactiveTintColor: 'gray',
        }}>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Search" component={Search} />
        <Tab.Screen name="Post" component={Post} />
        <Tab.Screen name="Messages" component={Messages} />
        <Tab.Screen name="Profile" component={Profile} />
        
      </Tab.Navigator>

  );
}

export default Homescreen;