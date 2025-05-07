export class UserId {
	private readonly value: string;

	private constructor(value: string) {
		this.value = value;
	}

	static create(value: string): UserId {
		if (!value || value.trim() === "") {
			throw new Error("ユーザーIDは空にできません");
		}
		return new UserId(value);
	}

	getValue(): string {
		return this.value;
	}

	equals(other: UserId): boolean {
		return this.value === other.value;
	}
}
