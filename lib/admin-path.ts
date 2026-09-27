/**
 * Ruta base del panel de administración. Vive en su propio módulo para que
 * NUNCA termine en el JavaScript de las páginas públicas: importalo solo desde
 * el panel, el proxy, next.config o código de servidor.
 */
export const ADMIN_BASE_PATH = "/vestuario";
