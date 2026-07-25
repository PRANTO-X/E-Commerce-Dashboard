import { configureStore } from "@reduxjs/toolkit"

import productReducer from "@/features/catalog/slices/productSlice"
import categoryReducer from "@/features/catalog/slices/categorySlice"
import inventoryReducer from "@/features/catalog/slices/inventorySlice"

import staffReducer from "@/features/users/slices/staffSlice"
import customerReducer from "@/features/users/slices/customerSlice"

import roleReducer from "@/features/system/slices/roleSlice"
import settingsReducer from "@/features/system/slices/settingsSlice"
import authSettingsReducer from "@/features/system/slices/authSettingsSlice"

import transactionReducer from "@/features/sales/slices/transactionSlice"
import orderReducer from "@/features/sales/slices/orderSlice"

import couponReducer from "@/features/marketing/slices/couponSlice"
import campaignReducer from "@/features/marketing/slices/campaignSlice"
import reviewReducer from "@/features/marketing/slices/reviewSlice"

export const store = configureStore({
  reducer: {
    products: productReducer,
    categories: categoryReducer,
    inventory: inventoryReducer,

    staffs: staffReducer,
    customers: customerReducer,

    roles: roleReducer,
    settings: settingsReducer,
    authSettings: authSettingsReducer,

    transactions: transactionReducer,
    orders: orderReducer,

    coupons: couponReducer,
    campaigns: campaignReducer,
    reviews: reviewReducer,


  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
