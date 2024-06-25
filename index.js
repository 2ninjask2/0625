/**
 * @format
 */

import {AppRegistry} from 'react-native';
import React from 'react';
import {name as appName} from './app.json';

import MainScreen from './screens/MainScreen';
import HomeScreen from './screens/HomeScreen';
import CameraScreen from './screens/CameraScreen';
import ItemDetailSettingScreen from './screens/ItemDetailSettingScreen';
import Recipe from './screens/RecipeScreen';
import CategoryScreen from './screens/CategoryScreen';
import ImageReviewScreen from './screens/ImageReviewScreen';
import PhotoGalleryScreen from './screens/PhotoGalleryScreen';
import  {CoreProvider } from './components/mainContext';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

Tab = createBottomTabNavigator();
Stack = createNativeStackNavigator();


const HomeStack =() => {
  return(
    <Stack.Navigator>
      <Stack.Screen name = "MainScreen" component={MainScreen} options={{ headerShown: false }} />
      <Stack.Screen name = "CameraScreen" component={CameraScreen} options={{ headerShown: false }} />
      <Stack.Screen name = "Category" component={CategoryScreen} options={{ headerLeft: null }}  />
      <Stack.Screen name = "Item" component={ItemDetailSettingScreen} options={{ headerShown: false }} />
      <Stack.Screen name = "ImageReviewScreen" component={ImageReviewScreen} options={{ title: '사진확인' }}/>
      <Stack.Screen name = "PhotoGalleryScreen" component={PhotoGalleryScreen} options={{ title: '사진 갤러리' }}/>
    </Stack.Navigator>

  );
};


const BottomTabNavigator = (props) => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}/>
        <Tab.Screen name="Main" component={HomeStack} options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="fridge-industrial-alert-outline" color={color} size={size} />
          ),}} />
        <Tab.Screen name="Recipe" component={Recipe} options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-list-outline" color={color} size={size} />
          ),
        }} />
      </Tab.Navigator>
    </NavigationContainer>);
  
};


const App = () => {
  return (
    <CoreProvider>
     <BottomTabNavigator />
    </CoreProvider>
 
  );
};

  AppRegistry.registerComponent(appName, () => App);