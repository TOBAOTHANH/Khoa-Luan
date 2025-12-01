import axios from "axios";
import { server } from "../../server";
// create product
// export const createProduct = (newForm) => async (dispatch) => {
//   try {
//     dispatch({
//       type: "productCreateRequest",
//     });
//     const config = { headers: { "Content-Type": "multipart/form-data" } };
//     const { data } = await axios.post(
//       `${server}/product/create-product`,
//       newForm,
//       config
//     );
//     dispatch({
//       type: "productCreateSuccess",
//       payload: data.product,
//     });
//   } catch (error) {
//     dispatch({
//       type: "productCreateFail",
//       payload: error.response.data.message,
//     });
//   }
// };
// create product
export const createProduct =
  (
    name,
    description,
    category,
    tags,
    originalPrice,
    discountPrice,
    stock,
    shopId,
    images
  ) =>
  async (dispatch) => {
    try {
      dispatch({
        type: "productCreateRequest",
      });

      const { data } = await axios.post(
        `${server}/product/create-product`,
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
        shopId,
        images,
      );
      dispatch({
        type: "productCreateSuccess",
        payload: data.product,
      });
    } catch (error) {
      dispatch({
        type: "productCreateFail",
        payload: error.response.data.message,
      });
    }
  };
// get All Products of a shop
export const getAllProductsShop = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsShopRequest",
    });

    const { data } = await axios.get(
      `${server}/product/get-all-products-shop/${id}`
    );
    dispatch({
      type: "getAllProductsShopSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsShopFailed",
      payload: error.response.data.message,
    });
  }
};

// delete product of a shop
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "deleteProductRequest",
    });

    const { data } = await axios.delete(
      `${server}/product/delete-shop-product/${id}`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "deleteProductSuccess",
      payload: data.message,
    });
  } catch (error) {
    dispatch({
      type: "deleteProductFailed",
      payload: error.response.data.message,
    });
  }
};



// get all products
export const getAllProducts = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllProductsRequest",
    });

    const { data } = await axios.get(`${server}/product/get-all-products`);
    dispatch({
      type: "getAllProductsSuccess",
      payload: data.products,
    });
  } catch (error) {
    dispatch({
      type: "getAllProductsFailed",
      payload: error.response.data.message,
    });
  }
};

// get single product by id
export const getProductById = (id) => async (dispatch) => {
  try {
    dispatch({
      type: "getProductByIdRequest",
    });

    const { data } = await axios.get(`${server}/product/get-product/${id}`);
    dispatch({
      type: "getProductByIdSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "getProductByIdFailed",
      payload: error.response?.data?.message || "Failed to get product",
    });
  }
};

// update product of a shop
export const updateProduct = (id, newForm) => async (dispatch) => {
  try {
    dispatch({
      type: "updateProductRequest",
    });

    const config = { headers: { "Content-Type": "multipart/form-data" } };
    const { data } = await axios.put(
      `${server}/product/update-shop-product/${id}`,
      newForm,
      {
        ...config,
        withCredentials: true,
      }
    );

    dispatch({
      type: "updateProductSuccess",
      payload: data.product,
    });
  } catch (error) {
    dispatch({
      type: "updateProductFailed",
      payload: error.response?.data?.message || "Failed to update product",
    });
  }
};

// get all reviews for a shop
export const getAllReviewsShop = () => async (dispatch) => {
  try {
    dispatch({
      type: "getAllReviewsShopRequest",
    });

    const { data } = await axios.get(
      `${server}/product/get-all-reviews-shop`,
      {
        withCredentials: true,
      }
    );

    dispatch({
      type: "getAllReviewsShopSuccess",
      payload: data.reviews,
    });
  } catch (error) {
    dispatch({
      type: "getAllReviewsShopFailed",
      payload: error.response?.data?.message || "Failed to get reviews",
    });
  }
};