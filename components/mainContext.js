// 프로젝트에서 전체적으로 공유할 변수 목록

import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CoreContext = createContext();

export const CoreProvider = ({ children }) => {
  const [items, setItems] = useState({});
  const [itemName, setItemName] = useState("");
  const [stock, setStock] = useState(1);
  const [category, setCategory] = useState('');
  const [exp, setExp] = useState("");
  const [memo, setMemo] = useState("");
  const ITEMS_KEY = "@items";
  const saveItems = async (toSave) => {
    try{
      await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(toSave));
    } catch (e){
      console.log(e);
    }
  };
  const icons = [
    {
      name : '과일',
      children : ['사과','포도','바나나','레몬','수박', '아보카도', '딸기', '감', '귤', '대추', '라임', '자두', '망고', '멜론', '방울토마토', '배', '복숭아', '블루베리', '오렌지', '올리브', '자몽', '참외', '체리', '키위','토마토', '파인애플'],
    },
    {
      name: '야채',
      children : ['고구마', '가지', '쪽파', '청경채', '콩나물', '피망', '호박', '당근','대파', '무', '배추', '버섯', '브로콜리', '상추', '시금치', '애호박', '양배추', '양상추', '양파', '연근', '오이', '옥수수', '감자', '고추'],
    },
    {
      name: '유제품',
      children : ['치즈'],
    },
    {
      name: '고기',
      children : ['달걀','닭고기','소고기','돼지고기'],
    },
    {
      name: '소스류',
      children : [],
    },
    {
      name: '반찬',
      children : ['반찬'],
    },
    {
      name: '수산물',
      children : ['생선','꽃게','새우','굴', '오징어', '멸치', '문어', '연어', '전복'],
    },
  ]

  return (
    <CoreContext.Provider
      value={{
        items,
        setItems,
        itemName,
        setItemName,
        stock,
        setStock,
        category,
        setCategory,
        exp,
        setExp,
        icons,
        memo,
        setMemo,
        ITEMS_KEY,
        saveItems,
      }}
    >
      {children}
    </CoreContext.Provider>
  );
};

export const useCoreContext = () => {
  return useContext(CoreContext);
};