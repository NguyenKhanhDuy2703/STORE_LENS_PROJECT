import {createSlice} from "@reduxjs/toolkit"

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: {
       metrics : {},
       chartData:{},
       tableData :{},
       loading: false,
       error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
    },
})

export default dashboardSlice.reducer