import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

const Detail = ({ route }) => {
    const item = route.params?.item;
    const navigation = useNavigation();

    const addToCart = async () => {
        try {
            const userId = await AsyncStorage.getItem('USERID');
            if (!userId) {
                console.log('USERID is missing');
                return;
            }

            const userDoc = await firestore().collection('users').doc(userId).get();
            let cart = userDoc._data?.cart || [];

            let exists = false;
            cart = cart.map(product => {
                if (product.id === item.id) {
                    exists = true;
                    return {
                        ...product,
                        data: {
                            ...product.data,
                            qty: (product.data?.qty || 0) + 1,
                        },
                    };
                }
                return product;
            });

            if (!exists) {
                cart.push({
                    ...item,
                    data: {
                        ...item,
                        qty: 1,
                    },
                });
            }

            await firestore().collection('users').doc(userId).update({ cart });
            navigation.goBack(); // tự động trigger useIsFocused bên Main
        } catch (err) {
            console.log('Error in addToCart:', err);
        }
    };

    if (!item) {
        return (
            <View style={styles.center}>
                <Text>Không có dữ liệu món ăn</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageWrapper}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.content}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.row}>
                        <Text style={styles.category}>{item.category}</Text>
                        <Text style={styles.rating}>⭐ {item.rating ?? 0}</Text>
                    </View>
                    <Text style={styles.vendor}>{item.vendor}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.discountPrice}>${item.discountPrice}</Text>
                        <Text style={styles.price}>${item.price}</Text>
                    </View>
                    <Text style={styles.description}>
                        {item.description || 'Không có mô tả'}
                    </Text>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.addToCartBtn} onPress={addToCart}>
                <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default Detail;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageWrapper: { position: 'relative' },
    image: { width: '100%', height: 300, resizeMode: 'cover' },
    content: { paddingHorizontal: 20, paddingTop: 15 },
    name: { fontSize: 28, fontWeight: 'bold', color: '#C62828', marginBottom: 8 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    category: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E1C1C',
        backgroundColor: '#FDECEA',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    rating: { fontSize: 16, fontWeight: '600', color: '#8E1C1C' },
    vendor: { fontSize: 16, fontStyle: 'italic', color: '#9E3B3B', marginBottom: 12 },
    priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    discountPrice: { fontSize: 24, fontWeight: 'bold', color: 'green' },
    price: {
        fontSize: 18,
        fontWeight: '600',
        color: '#9E3B3B',
        textDecorationLine: 'line-through',
        marginLeft: 12,
    },
    description: { fontSize: 16, color: '#4A0000', lineHeight: 24 },
    addToCartBtn: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#C62828',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
    },
    addToCartText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});
