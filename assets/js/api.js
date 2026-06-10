/**
 * API Service Module
 */
const API_BASE_URL = 'api'; // Menggunakan path relatif agar aman di sub-folder/localhost

export class ApiService {
    
    static BASE_URL = API_BASE_URL;
    
    static async handleResponse(response) {
        const json = await response.json().catch(() => ({ message: 'Invalid JSON response from server.' }));
        if (!response.ok) {
            const errorMessage = json.error || json.message || `HTTP Error: ${response.status}`;
            throw new Error(errorMessage);
        }
        return json;
    }

    static async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API Error (GET ${endpoint}):`, error);
            throw error;
        }
    }

    static async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`API Error (POST ${endpoint}):`, error);
            throw error;
        }
    }

    static async getLeads(userId, role) { // Role might be useful for caching/logging, though backend decides
        try {
            // Menggunakan get_leads.php yang sudah dibuat
            const url = `${API_BASE_URL}/get_leads.php?user_id=${encodeURIComponent(userId)}`;
            const response = await fetch(url);
            const leads = await this.handleResponse(response);
            
            // Menandai lead milik user sendiri agar tombol hapus & edit muncul
            return leads.map(lead => {
                if (lead.owner_id == userId) lead.owner = 'Self';
                return lead;
            });
        } catch (error) {
            console.error("API Error (getLeads):", error);
            return []; 
        }
    }

    static async createLead(leadData, userId) {
        try {
            const formData = new FormData();
            for (const key in leadData) {
                formData.append(key, leadData[key]);
            }
            formData.append('user_id', userId); // Tambahkan ID user yang sedang login

            const response = await fetch(`${API_BASE_URL}/leads.php?action=create`, {
                method: 'POST',
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (createLead):", error);
            throw error;
        }
    }

    static async updateLeadStatus(leadId, newStatus) {
        try {
            const formData = new FormData();
            formData.append('id', leadId);
            formData.append('status', newStatus);

            const response = await fetch(`${API_BASE_URL}/leads.php?action=update_status`, {
                method: 'POST',
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (updateLeadStatus):", error);
            throw error;
        }
    }

    static async deleteLead(leadId, userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/delete_lead.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead_id: leadId, user_id: userId })
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    }

    static async updateLeadData(leadData) {
        try {
            const formData = new FormData();
            for (const key in leadData) {
                formData.append(key, leadData[key]);
            }

            const response = await fetch(`${API_BASE_URL}/leads.php?action=update_data`, {
                method: 'POST',
                body: formData
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (updateLeadData):", error);
            throw error;
        }
    }

    static async generateAIContent(prompt) {
        try {
            const response = await fetch(`${API_BASE_URL}/gemini.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (generateAIContent):", error);
            throw error;
        }
    }

    static async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    }

    static async getDevelopers() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_developers.php`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (getDevelopers):", error);
            throw error;
        }
    }

    static async signup(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/signup.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (signup):", error);
            throw error;
        }
    }

    static async getPendingDevelopers() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_pending_developers.php`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (getPendingDevelopers):", error);
            throw error;
        }
    }

    static async updateDeveloperStatus(developerId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/update_developer_status.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    developer_id: developerId,
                    status: status 
                })
            });
            return await this.handleResponse(response);
        } catch (error) {
            throw error;
        }
    }

    static async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/get_all_users.php`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (getAllUsers):", error);
            throw error;
        }
    }

    static async getUserForImpersonation(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/get_user_for_impersonation.php?user_id=${userId}`);
            return await this.handleResponse(response);
        } catch (error) {
            console.error("API Error (getUserForImpersonation):", error);
            throw error;
        }
    }
}