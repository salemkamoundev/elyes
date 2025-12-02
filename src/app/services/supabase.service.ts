import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    this.bucketName = environment.supabaseConfig.bucket;
    // Crée le client avec la clé fournie (maintenant la clé secrète)
    this.supabase = createClient(environment.supabaseConfig.url, environment.supabaseConfig.key);
  }

  async uploadFile(file: File): Promise<string | null> {
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      
      // Upload vers le bucket défini dans l'environnement
      const { data, error } = await this.supabase.storage
        .from(this.bucketName) 
        .upload(fileName, file);

      if (error) {
        console.error('Erreur Upload Supabase:', error);
        // Si l'erreur est liée aux permissions (400 Bad Request), la clé secrète devrait la bypasser.
        // Si l'erreur persiste, assurez-vous que l'URL et le nom du bucket sont corrects.
        return null;
      }

      // Récupérer l'URL publique
      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName) 
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Exception Upload:', e);
      return null;
    }
  }
}
