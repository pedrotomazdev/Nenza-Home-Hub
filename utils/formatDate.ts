export function formatDateOnly(
    date: string | Date | undefined | null
): string | null {
    if (!date) return null;

    // Converte a string (ou Date) recebida em um objeto Date válido
    const dateObj: Date = typeof date === "string" ? new Date(date) : date;

    // Trata caso a string passada seja uma data inválida (ex: "data-invalida")
    if (isNaN(dateObj.getTime())) {
        return null;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


export function formatDateTime(
    date: string | Date | undefined | null,
    includeSeconds: boolean = true
): string | null {
    if (!date) return null;

    // Converte a string (ou Date) recebida em um objeto Date válido
    const dateObj: Date = typeof date === "string" ? new Date(date) : date;

    // Trata caso a string passada seja uma data inválida
    if (isNaN(dateObj.getTime())) {
        return null;
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    if (includeSeconds) {
        const seconds = String(dateObj.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}