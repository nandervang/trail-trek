import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { HikeFormData } from './types';

interface RouteDetailsProps {
  register: UseFormRegister<HikeFormData>;
  errors: FieldErrors<HikeFormData>;
}

export default function RouteDetails({ register, errors }: RouteDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="label">Distance (km)</label>
        <input
          type="number"
          step="0.1"
          className="input"
          {...register('distance_km', { 
            valueAsNumber: true,
            min: { value: 0, message: 'Distance must be positive' }
          })}
        />
        {errors.distance_km && (
          <p className="mt-1 text-sm text-error-500">{errors.distance_km.message}</p>
        )}
      </div>

      <div>
        <label className="label">Elevation Gain (meters)</label>
        <input
          type="number"
          className="input"
          {...register('elevation_gain', { 
            valueAsNumber: true,
            min: { value: 0, message: 'Elevation gain must be positive' }
          })}
        />
      </div>

      <div>
        <label className="label">Type</label>
        <select className="input" {...register('type')}>
          <option value="day_hike">Day Hike</option>
          <option value="overnight">Overnight</option>
          <option value="multi_day">Multi-day Trek</option>
          <option value="thru_hike">Thru-hike</option>
        </select>
      </div>

      <div>
        <label className="label">Difficulty Level</label>
        <select className="input" {...register('difficulty_level')}>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="challenging">Challenging</option>
          <option value="difficult">Difficult</option>
          <option value="extreme">Extreme</option>
        </select>
      </div>
    </div>
  );
}