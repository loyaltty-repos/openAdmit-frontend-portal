import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

const ProfileImageUpload = ({ onImageUpload, currentImage }) => {
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setLoading(true);      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'profile');

      await onImageUpload(formData);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 shadow-md group">
        <img
          src={currentImage || "/profile-full.svg"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={loading}
            />
            <Button
              variant="secondary"
              className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Change Photo
                </>
              )}
            </Button>
          </label>
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}
    </div>
  );
};

ProfileImageUpload.propTypes = {
  onImageUpload: PropTypes.func.isRequired,
  currentImage: PropTypes.string
};

ProfileImageUpload.defaultProps = {
  currentImage: "/profile-full.svg"
};

export default ProfileImageUpload;
