import axios from "axios";
import { server } from "../../server";


//get all sellerss --admin
export const getAllSellers = () => async (dispatch) => {
    try {
        dispatch({ 
            type: "getAllSellersRequest",

        });
        const { data } = await axios.get(`${server}/shop/admin-all-seller`, {withCredentials: true});
        dispatch({
            type: "getAllSellersSuccess",
            payload: data.seller,
        });
    } catch (error) {
        dispatch({
            type: "getAllSellersFail",
            payload: error.response.data.message,
        })
    }
};