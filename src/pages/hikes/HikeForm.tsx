import React from 'react';
import { useForm } from 'react-hook-form';

function HikeForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <div>
      <label htmlFor="distance_km" className="label">
        Distance (km)
      </label>
      <input
        id="distance_km"
        type="number"
        step="0.1"
        className="input"
        {...register('distance_km', { 
          min: { value: 0, message: 'Distance must be positive' },
          valueAsNumber: true
        })}
      />
      {errors.distance_km && (
        <p className="mt-1 text-sm text-error-500">{errors.distance_km.message}</p>
      )}
    </div>
  );
}

export default HikeForm;