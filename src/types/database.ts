export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          meta_title: string | null
          meta_description: string | null
          og_image: string | null
          sections: Json
          status: string
          updated_at: string
        }
        Insert: {
          slug: string
          title: string
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          sections?: Json
          status?: string
        }
        Update: {
          slug?: string
          title?: string
          meta_title?: string | null
          meta_description?: string | null
          og_image?: string | null
          sections?: Json
          status?: string
        }
      }
      services: {
        Row: {
          id: string
          title: string
          slug: string
          icon_url: string | null
          short_description: string
          full_description: Json | null
          deliverables: Json | null
          pricing_tiers: Json | null
          process_steps: Json | null
          faq: Json | null
          category: string
          display_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          slug: string
          short_description: string
          category: string
          icon_url?: string | null
          full_description?: Json | null
          deliverables?: Json | null
          pricing_tiers?: Json | null
          process_steps?: Json | null
          faq?: Json | null
          display_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          [key: string]: Json | string | number | boolean | null | undefined
        }
      }
      portfolio: {
        Row: {
          id: string
          title: string
          slug: string
          client_name: string | null
          industry: string | null
          service_id: string | null
          thumbnail_url: string | null
          banner_url: string | null
          gallery: Json | null
          challenge: Json | null
          solution: Json | null
          result: Json | null
          metrics: Json | null
          tools_used: string[] | null
          testimonial_id: string | null
          display_order: number
          is_featured: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
        }
        Insert: {
          title: string
          slug: string
          client_name?: string | null
          industry?: string | null
          service_id?: string | null
          thumbnail_url?: string | null
          banner_url?: string | null
          gallery?: Json | null
          challenge?: Json | null
          solution?: Json | null
          result?: Json | null
          metrics?: Json | null
          tools_used?: string[] | null
          testimonial_id?: string | null
          display_order?: number
          is_featured?: boolean
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          [key: string]: Json | string | number | boolean | string[] | null | undefined
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          featured_image: string | null
          content: Json | null
          excerpt: string | null
          category_id: string | null
          tags: string[] | null
          author: string
          reading_time: number | null
          status: string
          publish_date: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          slug: string
          author: string
          featured_image?: string | null
          content?: Json | null
          excerpt?: string | null
          category_id?: string | null
          tags?: string[] | null
          reading_time?: number | null
          status?: string
          publish_date?: string | null
          meta_title?: string | null
          meta_description?: string | null
        }
        Update: {
          [key: string]: Json | string | number | boolean | string[] | null | undefined
        }
      }
      blog_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
        }
      }
      bookings: {
        Row: {
          id: string
          client_name: string
          client_email: string
          client_phone: string | null
          service_id: string | null
          booking_date: string
          booking_time: string
          duration_minutes: number
          message: string | null
          status: string
          gcal_event_id: string | null
          created_at: string
        }
        Insert: {
          client_name: string
          client_email: string
          booking_date: string
          booking_time: string
          duration_minutes: number
          client_phone?: string | null
          service_id?: string | null
          message?: string | null
          status?: string
          gcal_event_id?: string | null
        }
        Update: {
          [key: string]: Json | string | number | boolean | null | undefined
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          service_interest: string | null
          budget_range: string | null
          message: string
          attachment_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          name: string
          email: string
          message: string
          phone?: string | null
          service_interest?: string | null
          budget_range?: string | null
          attachment_url?: string | null
          status?: string
        }
        Update: {
          [key: string]: Json | string | number | boolean | null | undefined
        }
      }
      testimonials: {
        Row: {
          id: string
          client_name: string
          client_company: string | null
          client_role: string | null
          client_photo: string | null
          quote: string
          rating: number
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          client_name: string
          quote: string
          client_company?: string | null
          client_role?: string | null
          client_photo?: string | null
          rating?: number
          display_order?: number
          is_active?: boolean
        }
        Update: {
          [key: string]: Json | string | number | boolean | null | undefined
        }
      }
      media: {
        Row: {
          id: string
          filename: string
          url: string
          type: string
          size_bytes: number
          alt_text: string | null
          created_at: string
        }
        Insert: {
          filename: string
          url: string
          type: string
          size_bytes?: number
          alt_text?: string | null
        }
        Update: {
          filename?: string
          url?: string
          type?: string
          size_bytes?: number
          alt_text?: string | null
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          html_body: string
          variables: Json | null
          updated_at: string
        }
        Insert: {
          name: string
          subject: string
          html_body: string
          variables?: Json | null
        }
        Update: {
          name?: string
          subject?: string
          html_body?: string
          variables?: Json | null
        }
      }
      page_views: {
        Row: {
          id: string
          page_path: string
          visitor_id: string | null
          referrer: string | null
          user_agent: string | null
          country: string | null
          created_at: string
        }
        Insert: {
          page_path: string
          visitor_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
        }
        Update: {
          page_path?: string
          visitor_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          country?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Page = Database['public']['Tables']['pages']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Portfolio = Database['public']['Tables']['portfolio']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type Media = Database['public']['Tables']['media']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
