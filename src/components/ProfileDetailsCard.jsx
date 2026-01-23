import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

const ProfileDetailsCard = ({ title, children, className, onEdit, canEdit = false, useModal = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleEditToggle = () => {
    if (isEditing) {

      setIsEditing(false);
      setIsModalOpen(false);
      if (onEdit) onEdit();
    } else {

      setIsEditing(true);
      if (useModal) {
        setIsModalOpen(true);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsModalOpen(false);
  };
  
  return (
    <div className={cn('bg-white rounded-lg p-2 sm:p-2 shadow-sm relative ', className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold  min-h-14 ">{title}</h2>
        {canEdit && (
          <div>
            {isEditing && !useModal ? (
              <div className="flex gap-2 ">
                <button 
                  onClick={handleCancel}
                  className="p-1 text-gray-500 hover:text-gray-700 "
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleEditToggle}
                  className="p-1 text-primary hover:text-green-700"
                  title="Save"
                >
                  <Save className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleEditToggle}
                className="p-1 text-gray-500 hover:text-gray-700 "
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="space-y-4 ">
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === DataField) {
            return React.cloneElement(child, { isEditing: isEditing && !useModal });
          }
          return child;
        })}
      </div>

      {/* Shadcn UI Dialog component */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg ">
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 ">
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child) && child.type === DataField) {

                return React.cloneElement(child, { 
                  key: index,
                  isEditing: true 
                });
              }
              return null;
            })}
          </div>
          
          <DialogFooter className="gap-2 ">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={handleEditToggle}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const DataField = ({ 
  icon, 
  label, 
  value, 
  className, 
  isEditing = false, 
  onValueChange,
  fieldName,
  fieldType = 'text',
  options = []
}) => {

  const iconWithWhiteStroke = icon ? React.cloneElement(icon, { 
    stroke: 'white',
    className: cn(icon.props.className, 'w-5 h-5')
  }) : null;

  const handleChange = (e) => {
    if (onValueChange) {
      onValueChange(fieldName, e.target.value);
    }
  };

  return (
    <div className={cn('flex items-start gap-2 sm:gap-3', className)}>
      {icon && <div className="bg-primary text-white p-1.5 rounded-md flex-shrink-0">{iconWithWhiteStroke}</div>}
      <div className="flex flex-col min-w-0 flex-grow">
        {label && <span className="text-base font-medium">{label}</span>}
        
        {isEditing ? (
          fieldType === 'select' ? (
            <select 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={value || ''}
              onChange={handleChange}
            >
              {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : fieldType === 'date' ? (
            <input 
              type="date"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={value || ''}
              onChange={handleChange}
            />
          ) : (
            <input 
              type={fieldType}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={value || ''}
              onChange={handleChange}
            />
          )
        ) : (
          <div className="text-sm text-gray-500 break-words">{value || 'Not specified'}</div>
        )}
      </div>
    </div>
  );
}

DataField.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.number]),
  className: PropTypes.string,
  isEditing: PropTypes.bool,
  onValueChange: PropTypes.func,
  fieldName: PropTypes.string,
  fieldType: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }))
};

ProfileDetailsCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  onEdit: PropTypes.func,
  canEdit: PropTypes.bool,
  useModal: PropTypes.bool
};

export default ProfileDetailsCard;