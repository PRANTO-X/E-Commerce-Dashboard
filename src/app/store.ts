import { configureStore } from "@reduxjs/toolkit"

import authReducer from "@/features/authentication/slices/authSlice"

import productReducer from "@/features/catalog/slices/productSlice"
import productImageReducer from "@/features/catalog/slices/productImageSlice"
import categoryReducer from "@/features/catalog/slices/categorySlice"
import inventoryReducer from "@/features/catalog/slices/inventorySlice"
import attributeReducer from "@/features/catalog/slices/attributeSlice"
import attributeValueReducer from "@/features/catalog/slices/attributeValueSlice"
import variantReducer from "@/features/catalog/slices/variantSlice"
import bundleItemReducer from "@/features/catalog/slices/bundleItemSlice"

import staffReducer from "@/features/users/slices/staffSlice"
import customerReducer from "@/features/users/slices/customerSlice"

import settingsReducer from "@/features/system/slices/settingsSlice"
import authSettingsReducer from "@/features/system/slices/authSettingsSlice"

import orderReducer from "@/features/sales/slices/orderSlice"

import couponReducer from "@/features/marketing/slices/couponSlice"
import campaignReducer from "@/features/marketing/slices/campaignSlice"
import reviewReducer from "@/features/marketing/slices/reviewSlice"
import flashSaleReducer from "@/features/marketing/slices/flashSaleSlice"
import flashSaleItemReducer from "@/features/marketing/slices/flashSaleItemSlice"
import groupBuyReducer from "@/features/marketing/slices/groupBuySlice"
import automationReducer from "@/features/marketing/slices/automationSlice"

import bannerReducer from "@/features/cms/slices/bannerSlice"
import blogPostReducer from "@/features/cms/slices/blogPostSlice"
import pageReducer from "@/features/cms/slices/pageSlice"

import notificationReducer from "@/features/notifications/slices/notificationSlice"
import auditLogReducer from "@/features/audit/slices/auditLogSlice"
import analyticsReducer from "@/features/analytics/slices/analyticsSlice"

import paymentReducer from "@/features/payments/slices/paymentSlice"
import returnReducer from "@/features/returns/slices/returnSlice"
import shippingReducer from "@/features/shipping/slices/shippingSlice"
import expenseReducer from "@/features/finance/slices/expenseSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,

    products: productReducer,
    productImages: productImageReducer,
    categories: categoryReducer,
    inventory: inventoryReducer,
    attributes: attributeReducer,
    attributeValues: attributeValueReducer,
    variants: variantReducer,
    bundleItems: bundleItemReducer,

    staffs: staffReducer,
    customers: customerReducer,

    settings: settingsReducer,
    authSettings: authSettingsReducer,

    orders: orderReducer,

    coupons: couponReducer,
    campaigns: campaignReducer,
    reviews: reviewReducer,
    flashSales: flashSaleReducer,
    flashSaleItems: flashSaleItemReducer,
    groupBuys: groupBuyReducer,
    automations: automationReducer,

    banners: bannerReducer,
    blogPosts: blogPostReducer,
    pages: pageReducer,

    notifications: notificationReducer,
    auditLogs: auditLogReducer,
    analytics: analyticsReducer,

    payments: paymentReducer,
    returns: returnReducer,
    shipping: shippingReducer,
    expenses: expenseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
