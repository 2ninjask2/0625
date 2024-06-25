import { View, Text, StyleSheet,TextInput, TouchableOpacity } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import  {useCoreContext} from '../components/mainContext';

const styles = StyleSheet.create({
    inputNameStyle:{
        fontSize:23,
        flex:1, 
        paddingTop: 0, 
        paddingBottom: 0,
        borderBottomColor:"gray",
        borderBottomWidth:1,
    },
    inputStockStyle:{
        fontSize:25,
        paddingTop: 0, 
        paddingBottom: 0,

    },
    propTextStyle:{
        fontSize:20,
        fontWeight:"600",
    },
    propViewStyle:{
        flexDirection:"row",
        justifyContent:"center",
        marginTop:10,
    },
    stockPropViewStyle:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginTop:10,
    }
});

export const PropComponant = ({onChangeText, value}) => {
    
    return(
        <View style={[styles.propViewStyle,]}>
            <TextInput 
                onChangeText={onChangeText} 
                value={value}
                multiline={true}
                numberOfLines={1}
                style={styles.inputNameStyle}/>     
        </View>
    );
};

export const StockPropComponant = ({propText, onChangeText, value, keyboardType="default"}) => {
    const { stock, setStock, } = useCoreContext();

    const onClickPlus = () => {
        setStock(prevStock => prevStock + 1);
    };
    const onClickMinus = () => {
        setStock(prevStock => (prevStock > 1 ? prevStock - 1 : 1));
    };
    return(
        <View style={[styles.stockPropViewStyle]}>
            <Text style={[styles.propTextStyle, {flex:1}]}>{propText}</Text>
            <View style = {{flexDirection:"row", justifyContent:"space-between",flex:1}}>
                <TouchableOpacity onPress={onClickPlus} activeOpacity={0.5} style={{}}>
                    <Text>
                        <Icon name="plus-circle-outline" size={30} color= "#000000" /> 
                    </Text>
                </TouchableOpacity>
                <TextInput 
                    onChangeText={onChangeText} 
                    keyboardType={keyboardType}
                    value={stock.toString()}
                    multiline={true}
                    numberOfLines={1}
                    style={styles.inputStockStyle}/>
                <TouchableOpacity onPress={onClickMinus} activeOpacity={0.5} style={{}}>
                    <Text>
                        <Icon name="minus-circle-outline" size={30} color= "#000000" /> 
                    </Text>
                </TouchableOpacity>
                
            </View>       
        </View>
    );
};
