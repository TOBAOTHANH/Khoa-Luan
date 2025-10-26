

import { React, useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const Singup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();
  
  // Xử lý ảnh xem trước khi chọn file
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  // useEffect để cập nhật avatarPreview khi avatar thay đổi
  useEffect(() => {
    if (avatar) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(avatar);
    } else {
      setAvatarPreview(null);
    }
  }, [avatar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: {} };
    const newForm = new FormData();
    newForm.append("file", avatar);
    newForm.append("name", name);
    newForm.append("email", email);
    newForm.append("password", password);
    
    axios
    .post(`${server}/user/create-user`, newForm, config)
    .then((res) => {
      toast.success(res.data.message);
      navigate("/login");
      setName("");
      setEmail("");
      setPassword("");
      setAvatar(null);
      setAvatarPreview(null);
    })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message);
      });
  };
  
  
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng Ký Tài Khoản Mới
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
                >
                Tên Đầy Đủ
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="text"
                  autoComplete="name"
                  placeholder="Vui lòng nhập tên đầy đủ"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
                >
                Địa Chỉ Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Vui lòng nhập email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
                >
                Nhập Mật Khẩu
              </label>
              <div className="mt-1 relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Vui lòng nhập mật khẩu"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {visible ? (
                  <AiOutlineEye
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                    className="absolute right-2 top-2 cursor-pointer"
                    size={25}
                    onClick={() => setVisible(true)}
                    />
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <div className="mt-2 flex items-center">
                <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                  {avatar ? (
                    <img
                    src={URL.createObjectURL(avatar)}
                      alt="avatar"
                      className="h-full w-full object-cover rounded-full"
                      />
                  ) : (
                    <RxAvatar className="h-8 w-8" />
                  )}
                </span>
                <label
                  htmlFor="file-input"
                  className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span>Tải ảnh lên</span>
                  <input
                    type="file"
                    name="avatar"
                    id="file-input"
                    accept=".jpg,.jpeg,.png, .jfif, .webp"
                    onChange={handleFileInputChange}
                    className="sr-only"
                    />
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                Đăng ký
              </button>
            </div>
            <div className={`${styles.noramlFlex} w-full`}>
              <h4>Bạn đã có tài khoản?</h4>
              <Link to="/login" className="text-blue-600 pl-2">
                Đăng Nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Singup;
  
  
  
  
  
  // import { React, useState } from "react";
  // import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
  // import styles from "../../styles/styles";
  // import { Link, useNavigate } from "react-router-dom";
  // import { RxAvatar } from "react-icons/rx";
  // import axios from "axios";
  // import { server } from "../../server";
  // import { toast } from "react-toastify";
  
  // const Signup = () => {
  //   const [email, setEmail] = useState("");
  //   const [name, setName] = useState("");
  //   const [password, setPassword] = useState("");
  //   const [visible, setVisible] = useState(false);
  //   const [avatar, setAvatar] = useState(null);
  //   const [avatarPreview, setAvatarPreview] = useState(null); // State for avatar preview
  //   const navigate = useNavigate();
    
  //   const handleFileInputChange = (e) => {
  //     const file = e.target.files[0];
  //     setAvatar(file);
  
  //     // Create a preview of the selected avatar using FileReader
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setAvatarPreview(reader.result); // Set the preview image source
  //     };
  //     if (file) {
  //       reader.readAsDataURL(file); // Read the selected file
  //     }
  //   };
  
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
      
  //     const config = { headers: {} };
  //     const newForm = new FormData();
  //     newForm.append("file", avatar);
  //     newForm.append("name", name);
  //     newForm.append("email", email);
  //     newForm.append("password", password);
      
  //     axios
  //     .post(`${server}/user/create-user`, newForm, config)
  //     .then((res) => {
  //         console.log(res);
  //         toast.success(res.data.message);
  //         navigate("/login");
  //         setName("");
  //         setEmail("");
  //         setPassword("");
  //         setAvatar(null);
  //         setAvatarPreview(null); // Reset the preview
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         toast.error(err.response.data.message);
  //       });
  //   };
  
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
  //       <div className="sm:mx-auto sm:w-full sm:max-w-md">
  //         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
  //           Register as a new user
  //         </h2>
  //       </div>
  //       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
  //         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
  //           <form className="space-y-6" onSubmit={handleSubmit}>
  //             <div>
  //               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
  //                 Full Name
  //               </label>
  //               <div className="mt-1">
  //                 <input
  //                   type="text"
  //                   name="name"
  //                   autoComplete="name"
  //                   required
  //                   value={name}
  //                   onChange={(e) => setName(e.target.value)}
  //                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //                   />
  //               </div>
  //             </div>
  
  //             <div>
  //               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
  //                 Email address
  //               </label>
  //               <div className="mt-1">
  //                 <input
  //                   type="email"
  //                   name="email"
  //                   autoComplete="email"
  //                   required
  //                   value={email}
  //                   onChange={(e) => setEmail(e.target.value)}
  //                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //                   />
  //               </div>
  //             </div>
  
  //             <div>
  //               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
  //                 Password
  //               </label>
  //               <div className="mt-1 relative">
  //                 <input
  //                   type={visible ? "text" : "password"}
  //                   name="password"
  //                   autoComplete="current-password"
  //                   required
  //                   value={password}
  //                   onChange={(e) => setPassword(e.target.value)}
  //                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  //                   />
  //                 {visible ? (
  //                   <AiOutlineEye
  //                   className="absolute right-2 top-2 cursor-pointer"
  //                   size={25}
  //                   onClick={() => setVisible(false)}
  //                   />
  //                 ) : (
  //                   <AiOutlineEyeInvisible
  //                   className="absolute right-2 top-2 cursor-pointer"
  //                   size={25}
  //                   onClick={() => setVisible(true)}
  //                   />
  //                 )}
  //               </div>
  //             </div>
  
  //             <div>
  //               <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
  //                 Avatar
  //               </label>
  //               <div className="mt-2 flex items-center">
  //                 <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
  //                   {avatarPreview ? (
  //                     <img
  //                     src={avatarPreview}
  //                     alt="avatar preview"
  //                       className="h-full w-full object-cover rounded-full"
  //                       />
  //                     ) : (
  //                       <RxAvatar className="h-8 w-8" />
  //                   )}
  //                 </span>
  //                 <label
  //                   htmlFor="file-input"
  //                   className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
  //                   >
  //                   <span>Upload a file</span>
  //                   <input
  //                     type="file"
  //                     name="avatar"
  //                     id="file-input"
  //                     accept=".jpg,.jpeg,.png,.jfif,.webp"
  //                     onChange={handleFileInputChange}
  //                     className="sr-only"
  //                     />
  //                 </label>
  //               </div>
  //             </div>
  
  //             <div>
  //               <button
  //                 type="submit"
  //                 className="group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
  //               >
  //                 Submit
  //               </button>
  //             </div>
  //             <div className={`${styles.noramlFlex} w-full`}>
  //               <h4>Already have an account?</h4>
  //               <Link to="/login" className="text-blue-600 pl-2">
  //                 Sign In
  //               </Link>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
  
  // export default Signup;