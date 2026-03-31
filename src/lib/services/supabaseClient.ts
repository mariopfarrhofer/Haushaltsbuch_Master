import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client.
// Note: Ensure @supabase/supabase-js is installed in your project.
// Replace the fallback strings with your actual Supabase URL and key 
// if you are not using environment variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Define type for a reading, adjust fields according to your actual schema
export interface WaterReading {
  id?: number | string;
  // add other fields you might be tracking
  [key: string]: any; 
}

export const SupabaseService = {
  /**
   * Fetch all water readings.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('water_readings')
      .select('*');

    if (error) {
      console.error('Error fetching all readings:', error);
      throw error;
    }

    return data;
  },

  /**
   * Add a new water reading.
   * @param reading The reading data to insert.
   */
  async add(reading: Omit<WaterReading, 'id'>) {
    const { data, error } = await supabase
      .from('water_readings')
      .insert([reading])
      .select()
      .single();

    if (error) {
      console.error('Error adding reading:', error);
      throw error;
    }

    return data;
  },

  /**
   * Delete a water reading by ID.
   * @param id The ID of the reading to delete.
   */
  async delete(id: number | string) {
    const { data, error } = await supabase
      .from('water_readings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reading:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get the latest water reading.
   * Assuming there is a 'created_at' or 'date' column to determine the latest.
   * Please adjust the ordering column if your schema uses a different name.
   */
  async getLatest() {
    const { data, error } = await supabase
      .from('water_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Supabase throws an error if no rows are returned and .single() is used
      if (error.code === 'PGRST116') {
        return null; // Return null if there are no readings
      }
      console.error('Error fetching latest reading:', error);
      throw error;
    }

    return data;
  }
};
