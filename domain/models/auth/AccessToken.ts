export class AccessToken {
    private readonly token: string;
    private readonly expiresAt: Date;
  
    private constructor(token: string, expiresAt: Date) {
      this.token = token;
      this.expiresAt = expiresAt;
    }
  
    static create(token: string, expiresInSeconds: number): AccessToken {
      if (!token || token.trim() === '') {
        throw new Error('アクセストークンは空にできません');
      }
  
      if (expiresInSeconds <= 0) {
        throw new Error('有効期限は0より大きい値である必要があります');
      }
  
      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
      return new AccessToken(token, expiresAt);
    }
  
    static restore(token: string, expiresAtTimestamp: number): AccessToken {
      if (!token || token.trim() === '') {
        throw new Error('アクセストークンは空にできません');
      }
  
      const expiresAt = new Date(expiresAtTimestamp);
      
      if (expiresAt <= new Date()) {
        throw new Error('有効期限切れのトークンは復元できません');
      }
  
      return new AccessToken(token, expiresAt);
    }
  
    getToken(): string {
      return this.token;
    }
  
    getExpiresAt(): Date {
      return new Date(this.expiresAt);
    }

    isExpired(): boolean {
      return new Date() >= this.expiresAt;
    }

    equals(other: AccessToken): boolean {
      return this.token === other.token && 
             this.expiresAt.getTime() === other.expiresAt.getTime();
    }
}
  
