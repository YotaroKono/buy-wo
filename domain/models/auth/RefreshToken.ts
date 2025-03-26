export class RefreshToken {
    private readonly token: string;
  
    private constructor(token: string) {
      this.token = token;
    }
  
    static create(token: string): RefreshToken {
      if (!token || token.trim() === '') {
        throw new Error('リフレッシュトークンは空にできません');
      }
      return new RefreshToken(token);
    }
  
    getToken(): string {
      return this.token;
    }
  
    equals(other: RefreshToken): boolean {
      return this.token === other.token;
    }
}