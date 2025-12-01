import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    isLoading: true,

}

export const productReducer = createReducer(initialState, (builder) => {
    builder
        .addCase('productCreateRequest', (state) => {
            state.isLoading = true;
        })
        .addCase('productCreateSuccess', (state, action) => {
            state.isLoading = false;
            state.product = action.payload;
            state.success = true;
        })
        .addCase('productCreateFail', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.success = false;
        })

        // get all products
        .addCase('getAllProductsShopRequest', (state) => {
            state.isLoading = true;
        })
        .addCase('getAllProductsShopSuccess', (state, action) => {
            state.isLoading = false;
            state.products = action.payload;
        })
        .addCase('getAllProductsShopFailed', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
        //delete product

        .addCase('deleteProductRequest', (state) => {
            state.isLoading = true;

        })
        .addCase('deleteProductSuccess', (state, action) => {
            state.isLoading = false;
            state.message = action.payload;

        })
        .addCase('deleteProductFailed', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;

        })
        // clear error
        .addCase('clearError', (state) => {
            state.error = null;
        })

         // get all products
         .addCase('getAllProductsRequest', (state) => {
            state.isLoading = true;
        })
        .addCase('getAllProductsSuccess', (state, action) => {
            state.isLoading = false;
            state.allProducts = action.payload;
        })
        .addCase('getAllProductsFailed', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // clear success
        .addCase('clearSuccess', (state) => {
            state.success = false;
        })

        // get product by id
        .addCase('getProductByIdRequest', (state) => {
            state.isLoading = true;
        })
        .addCase('getProductByIdSuccess', (state, action) => {
            state.isLoading = false;
            state.singleProduct = action.payload;
        })
        .addCase('getProductByIdFailed', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })

        // update product
        .addCase('updateProductRequest', (state) => {
            state.isLoading = true;
        })
        .addCase('updateProductSuccess', (state, action) => {
            state.isLoading = false;
            state.product = action.payload;
            state.success = true;
        })
        .addCase('updateProductFailed', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.success = false;
        })

        // get all reviews for shop
        .addCase('getAllReviewsShopRequest', (state) => {
            state.isLoading = true;
        })
        .addCase('getAllReviewsShopSuccess', (state, action) => {
            state.isLoading = false;
            state.reviews = action.payload;
        })
        .addCase('getAllReviewsShopFailed', (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
});