import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { HikeFormData } from './types';

interface BasicInfoProps {
  register: UseFormRegister<HikeFormData>;
  errors: FieldErrors<HikeFormData>;
}

export default function BasicInfo({ register, errors }: BasicInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="label">Hike Name *</label>
        <input
          type="text"
          className={`input ${errors.name ? 'border-error-500' : ''}`}
          {...register('name', { required: 'Name is required' })}
          placeholder="Give your hike a name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={3}
          {...register('description')}
          placeholder="Describe your hike"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            className="input"
            {...register('start_date')}
          />
        </div>

        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            className="input"
            {...register('end_date')}
          />
        </div>
      </div>
    </div>
  );
}