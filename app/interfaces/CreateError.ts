export type CreateError = "UNERR" | "PAID" | "INTERNAL"

export type APIResponse = {
    error?: CreateError
    url?: string    
}