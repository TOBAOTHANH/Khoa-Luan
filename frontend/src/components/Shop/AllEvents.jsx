import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineGift } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { deleteEvent, getAllEventsShop } from "../../redux/actions/event";
import Loader from "../Layout/Loader";

const AllEvents = () => {
  const { events, isLoading } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllEventsShop(seller._id));
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      dispatch(deleteEvent(id));
      window.location.reload();
    }
  }

  const columns = [
    { field: "id", headerName: "ID Sự Kiện", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Tên Sự Kiện",
      minWidth: 200,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Giá",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-semibold text-green-600">{params.value}</span>
      ),
    },
    {
      field: "Stock",
      headerName: "Tồn Kho",
      type: "number",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span className={params.value > 0 ? "text-green-600" : "text-red-600"}>
          {params.value}
        </span>
      ),
    },
    {
      field: "sold",
      headerName: "Đã Bán",
      type: "number",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span className="font-medium text-blue-600">{params.value || 0}</span>
      ),
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 120,
      headerName: "Xem",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        const d = params.row.name;
        const product_name = d.replace(/\s+/g, "-");
        return (
          <Link to={`/events}`}>
            <Button className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <AiOutlineEye size={20} />
            </Button>
          </Link>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "Xóa",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <Button 
            onClick={() => handleDelete(params.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <AiOutlineDelete size={20} />
          </Button>
        );
      },
    },
  ];

  const row = [];

  events &&
    events.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: "US$ " + item.discountPrice,
        Stock: item.stock,
        sold: item.sold_out || 0,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <AiOutlineGift className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Quản Lý Sự Kiện
                  </h1>
                  <p className="text-pink-100 text-sm">
                    Tổng số sự kiện: {events?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {events && events.length === 0 ? (
                <div className="text-center py-12">
                  <AiOutlineGift className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 text-lg mb-4">Chưa có sự kiện nào</p>
                  <Link
                    to="/dashboard-create-event"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <AiOutlineGift size={18} />
                    Tạo sự kiện đầu tiên
                  </Link>
                </div>
              ) : (
                <DataGrid
                  rows={row}
                  columns={columns}
                  pageSize={10}
                  disableSelectionOnClick
                  autoHeight
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f9fafb',
                      fontWeight: 'bold',
                      borderBottom: '2px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#fce7f3',
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllEvents;
