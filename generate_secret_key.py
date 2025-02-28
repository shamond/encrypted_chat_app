from cryptography.fernet import Fernet

def generate_secret_key() -> str:
    """
    Generuje bezpieczny klucz przy użyciu cryptography.Fernet.
    Zwraca klucz jako ciąg znaków zakodowany w formacie URL-safe Base64.
    """
    key = Fernet.generate_key()
    return key.decode('utf-8')

if __name__ == "__main__":
    secret_key = generate_secret_key()
    print("Wygenerowany secret_key:", secret_key)
