import { useState } from "react";
import { Heading } from "../../components/Heading";
import { SubHeading } from "../../components/SubHeading";
import { InputBox } from "../../components/InputBox";
import { Button } from "../../components/Button";
import axios from "axios";
import { TextAreaBox } from "../../components/TextAreaBox";
import { useNavigate } from "react-router-dom";
import { backendUrl, cloudinaryCloudName, cloudinaryUploadPreset, cloudinaryURL } from "../../utils/config";
import { UploadInnovativeProductType } from "@abhiram2k03/punarnavah-common";
import { Dropdown } from "../../components/Dropdown";
import { UploadImage } from "../../components/UploadImage";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import { Lightbulb, Zap, Atom } from 'lucide-react'
import { ErrorMsgComp } from "../../components/ErrorMsgComp";

export const UploadInnovativeProdPage = () => {
  const [uploadReq, setUploadReq] = useState<UploadInnovativeProductType>({
    image: "",
    name: "",
    description: "",
    quantity: 0,
    materialsUsed: "",
    price: 0,
  });
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImg(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);
    formData.append("cloud_name", cloudinaryCloudName);

    axios.defaults.withCredentials = false;
    const response = await axios.post(cloudinaryURL, formData);
    axios.defaults.withCredentials = true;
    return response.data.secure_url;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setUploadReq((prevState) => ({
      ...prevState,
      [name]: (name === "quantity" || name === "price")
        ? Number(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = uploadReq.image;

      if (selectedImg instanceof File) {
        imageUrl = await uploadImage(selectedImg);
      }

      const updatedUploadReq = {
        ...uploadReq,
        image: imageUrl,
        quantity: Number(uploadReq.quantity),
        price: Number(uploadReq.price),
      };

      const response = await axios.post(`${backendUrl}/api/v1/innovative-prod`, updatedUploadReq);

      if (response.status === 201) {
        toast.success("Innovative Product created successfully");
        navigate(`/profile`);
      } 
      else {
        console.error("Error occurred", response.data.error[0].message);
        toast.error(response.data.error[0].message);
      }

    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Unauthorized access. Please login to continue.");
        localStorage.removeItem("token");
        navigate("/signin");
      } else {
        const errorMessage = error.response?.data?.errors?.[0]?.message ||
          error.response?.data?.message ||
          "An error occurred";
        toast.error(errorMessage);
      }
      console.error( error);
      setError("Request creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
    <Navbar />
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left section for image upload */}
          <div className="w-full lg:w-2/5 p-8 bg-gradient-to-br from-green-100 to-blue-100  rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <Lightbulb className="absolute top-4 left-4 w-16 h-16 text-yellow-600" />
              <Zap className="absolute bottom-4 right-4 w-16 h-16 text-blue-600" />
              <Atom className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-purple-600" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Showcase Your Innovation</h2>
              <p className="text-green-700 mb-6">Upload an image of your groundbreaking product!</p>
              <UploadImage name="" handleImageChange={handleImageChange} />
            </div>
          </div>

          {/* Right section for the form */}
          <div className="w-full lg:w-3/5 p-8">
            <div className="text-center mb-8">
              <Heading text="Innovative Product Details" />
              <SubHeading text="Fill in the information below to list your product" />
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputBox
                  label="Product Name"
                  type="text"
                  placeholder="Enter product name"
                  name="name"
                  onChange={handleInputChange}
                />
                <InputBox
                  label="Quantity"
                  type="number"
                  placeholder="Enter quantity"
                  name="quantity"
                  onChange={handleInputChange}
                />
                <Dropdown
                  name="quantityUnit"
                  label="Choose a unit"
                  options={["gms", "kgs", "tons", "units"]}
                  handleInputChange={handleInputChange}
                />
                <InputBox
                  label="Price"
                  type="number"
                  placeholder="Enter price"
                  name="price"
                  onChange={handleInputChange}
                />
              </div>
              <TextAreaBox
                label="Product Description"
                placeholder="Describe your innovative product"
                name="description"
                onChange={handleInputChange}
              />
              <TextAreaBox
                label="Materials Used"
                placeholder="List the materials used in your product"
                name="materialsUsed"
                onChange={handleInputChange}
              />
             <ErrorMsgComp error={error!} />
              <div className="pt-4 flex items-center justify-center">
                <Button text={loading ? "Submitting..." : "List Product"} onClick={handleSubmit} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  );
};
