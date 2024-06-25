import React ,{useState, useEffect} from "react";
import { Image,View, ActivityIndicator } from 'react-native';
import * as Icons from '../assets/icons';
import RNFS from 'react-native-fs';

const SvgIcon = ({name, width:_width, height:_height, size, ...props}) => {

    let Comp = Icons[name] || Icons['기본']; 

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fileName, setFileName] = useState(name);


    useEffect(() => {
        setFileName(name);
        loadImage();
    },[name]);
    useEffect(() => {
        loadImage();
    },[]);


    const loadImage = async () => {
        setLoading(true);

        try {
            const imagePath = `${RNFS.DocumentDirectoryPath}/icon/${name}.png`;
            const exists = await RNFS.exists(imagePath);
            if (exists) {
              const base64Image = await RNFS.readFile(imagePath, 'base64');
              setImage(`data:image/jpeg;base64,${base64Image}`);
            } else {
                setImage(null);
            }
          } catch (error) {
            console.error('Error loading image:', error);
          } finally {
            setLoading(false);
          }
    };

    const width = _width ?? size;
    const height = _height ?? size;
    //조건부 객체 속성 할당
    const sizeProps = {
        ...(width !== undefined ? {width} : {}),
        ...(height !== undefined ? {height} : {}),
    };

    if(loading) {
        return <ActivityIndicator size="small" color="#0000ff"/>
    }

    return (
        <View style={{alignItems: 'center'}}>
            {image ?
                <Image
                    source={{ uri: image }}
                    style={{ width: size, height: size }}
                  /> :
                <Comp
                {...props}
                {...sizeProps} 
                />
            }
        </View>
        
    );

}

export default SvgIcon;