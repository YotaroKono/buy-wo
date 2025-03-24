export class RefreshToken {
    private readonly token: string;
  
    private constructor(token: string) {
      this.token = token;
    }
  
    public static create(token: string): RefreshToken {
      if (!token || token.trim() === '') {
        throw new Error('リフレッシュトークンは空にできません');
      }
      return new RefreshToken(token);
    }
  
    public getToken(): string {
      return this.token;
    }
  
    public equals(other: RefreshToken): boolean {
      return this.token === other.token;
    }
}