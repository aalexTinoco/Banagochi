const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

let authToken: string | null = null;
let userIdCache: string | null = null;

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

function setAuthToken(token: string | null) {
  authToken = token;
}

function setUserId(id: string | null) {
  userIdCache = id;
}

function getHeaders(isJson = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data: any = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
}

// pequeño wrapper para GET/POST/etc
async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: any,
  opts?: { isJsonBody?: boolean }
): Promise<T> {
  const isJsonBody = opts?.isJsonBody ?? true;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(isJsonBody),
    body: body
      ? isJsonBody
        ? JSON.stringify(body)
        : body // ej. FormData
      : undefined,
  });

  return handleResponse<T>(res);
}

// ─────────────────────────────────────────────
// Tipos rápidos (puedes ampliar según tu backend real)
// ─────────────────────────────────────────────
export type User = {
  _id: string;
  name: string;
  email: string;
  role?: any;
  colony?: string;
  curp?: string;
  domicilio?: string;
  banorteAccount?: {
    number: string;
    alias: string;
    linked: boolean;
    balance: number;
  };
  savedProjects?: string[];
  votedProjects?: string[];
  impactSummary?: {
    totalContributed: number;
    completedProjects: number;
    balanceContributed: number;
  };
  status?: string;
};

export type Card = {
  _id: string;
  userId: string;
  cardNumber: string;
  holderName: string;
  expiry: string;
  type: string; // banortemujer | banorteclasica | banorteoro ...
  maxCredit: number;
  cutoffDay: number;
  status?: string;
};

export type Category = {
  _id: string;
  name: string;
  description?: string;
};

export type Company = {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
};

export type Manufacturer = {
  _id: string;
  name: string;
  description?: string;
  country?: string;
  website?: string;
};

export type Contact = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
};

export type Certification = {
  _id: string;
  name: string;
  description?: string;
  issuer?: string;
  expiryDate?: string;
};

export type Note = {
  _id: string;
  title: string;
  content: string;
  category?: string;
  priority?: string;
};

export type MenuItem = {
  _id: string;
  label: string;
  icon?: string;
  route?: string;
  roles?: string[];
};

// ─────────────────────────────────────────────
// API agrupada
// ─────────────────────────────────────────────

export const api = {
  // ---------------- AUTH ----------------
  auth: {
    // POST /api/auth/register
    async register(payload: {
      name: string;
      email: string;
      password: string;
      role: Array<{ name: string; permissions: string[] }>;
      colony: string;
      curp: string;
      domicilio: string;
    }): Promise<User> {
      const data = await request<User>("POST", "/api/auth/register", payload);
      // guardamos userId de conveniencia
      if (data?._id) {
        setUserId(data._id);
      }
      return data;
    },

    // POST /api/auth/login
    async login(payload: {
      email: string;
      password: string;
      deviceId: string;
      deviceName: string;
      token: string; // push token / FCM
    }): Promise<{
      token: string;
      user: User;
    }> {
      const data = await request<{
        token: string;
        user: User;
      }>("POST", "/api/auth/login", payload);

      // cachear token y userId en memoria del cliente
      if (data?.token) setAuthToken(data.token);
      if (data?.user?._id) setUserId(data.user._id);

      return data;
    },

    // POST /api/auth/logout
    async logout(payload: {
      userId: string;
      deviceId: string;
    }): Promise<{ message: string }> {
      const data = await request<{ message: string }>(
        "POST",
        "/api/auth/logout",
        payload
      );
      // limpiar cache local
      setAuthToken(null);
      return data;
    },
  },

  // ---------------- USERS ----------------
  users: {
    // GET /api/users
    async getAll(): Promise<User[]> {
      return request<User[]>("GET", "/api/users");
    },

    // GET /api/users/:id
    async getById(id?: string): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>("GET", `/api/users/${targetId}`);
    },

    // PATCH /api/users/:id
    async updateUser(
      updates: Partial<Pick<User, "name" | "colony">>,
      id?: string
    ): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>("PATCH", `/api/users/${targetId}`, updates);
    },

    // PATCH /api/users/:id/curp
    async updateCurp(curp: string, id?: string): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>("PATCH", `/api/users/${targetId}/curp`, { curp });
    },

    // PATCH /api/users/:id/domicilio
    async updateDomicilio(domicilio: string, id?: string): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>(
        "PATCH",
        `/api/users/${targetId}/domicilio`,
        { domicilio }
      );
    },

    // PATCH /api/users/:id/banorte-account
    async updateBanorteAccount(
      account: {
        number: string;
        alias: string;
        linked: boolean;
        balance: number;
      },
      id?: string
    ): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>(
        "PATCH",
        `/api/users/${targetId}/banorte-account`,
        account
      );
    },

    // PATCH /api/users/:id/saved-projects
    async addSavedProject(projectId: string, id?: string): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>(
        "PATCH",
        `/api/users/${targetId}/saved-projects`,
        { projectId }
      );
    },

    // PATCH /api/users/:id/voted-projects
    async addVotedProject(projectId: string, id?: string): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>(
        "PATCH",
        `/api/users/${targetId}/voted-projects`,
        { projectId }
      );
    },

    // PATCH /api/users/:id/impact-summary
    async updateImpactSummary(
      summary: {
        totalContributed: number;
        completedProjects: number;
        balanceContributed: number;
      },
      id?: string
    ): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>(
        "PATCH",
        `/api/users/${targetId}/impact-summary`,
        summary
      );
    },

    // DELETE /api/users/:id  (baja lógica)
    async softDelete(id?: string): Promise<{ message: string }> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<{ message: string }>(
        "DELETE",
        `/api/users/${targetId}`
      );
    },
  },

  // ---------------- CREDIT CARDS ----------------
  cards: {
    // POST /api/cards
    async create(payload: {
      userId: string;
      cardNumber: string;
      holderName: string;
      expiry: string;
      type: string;
      maxCredit: number;
      cutoffDay: number;
    }): Promise<Card> {
      return request<Card>("POST", `/api/cards`, payload);
    },

    // GET /api/cards/user/:userId
    async getByUser(userId?: string): Promise<Card[]> {
      const id = userId || userIdCache;
      if (!id) throw new Error("No userId provided");
      return request<Card[]>(`GET`, `/api/cards/user/${id}`);
    },

    // GET /api/cards/:cardId
    async getById(cardId: string): Promise<Card> {
      return request<Card>("GET", `/api/cards/${cardId}`);
    },

    // PATCH /api/cards/:cardId
    async updateCard(
      cardId: string,
      updates: Partial<Pick<Card, "maxCredit" | "cutoffDay" | "status">>
    ): Promise<Card> {
      return request<Card>("PATCH", `/api/cards/${cardId}`, updates);
    },

    // DELETE /api/cards/:cardId
    async deleteCard(cardId: string): Promise<{ message: string }> {
      return request<{ message: string }>(
        "DELETE",
        `/api/cards/${cardId}`
      );
    },
  },

  // ---------------- MENU ----------------
  menu: {
    // GET /api/menu
    async getAll(): Promise<MenuItem[]> {
      return request<MenuItem[]>("GET", `/api/menu`);
    },
  },

  // ─────────────────────────────────────
  // Extras del otro backend (MYD style)
  // Rutas bajo /api/routes/...
  // ─────────────────────────────────────

  mydAuth: {
    // POST /api/routes/users/auth  (login)
    async login(payload: { email: string; password: string }): Promise<{
      accessToken: string;
      refreshToken: string;
      user?: { _id: string; [k: string]: any };
    }> {
      const data = await request<{
        accessToken: string;
        refreshToken: string;
        user?: { _id: string };
      }>("POST", "/api/routes/users/auth", payload);

      if (data.accessToken) setAuthToken(data.accessToken);
      if (data.user?._id) setUserId(data.user._id);

      return data;
    },

    // POST /api/routes/users/auth/refresh
    async refresh(payload: { refreshToken: string }) {
      const data = await request<{
        accessToken: string;
        refreshToken: string;
      }>("POST", "/api/routes/users/auth/refresh", payload);

      if (data.accessToken) setAuthToken(data.accessToken);
      return data;
    },

    // DELETE /api/routes/users/auth  (logout)
    async logout(): Promise<{ message?: string }> {
      const data = await request<{ message?: string }>(
        "DELETE",
        "/api/routes/users/auth"
      );
      setAuthToken(null);
      setUserId(null);
      return data;
    },

    // GET /api/routes/users/auth?action=time
    async tokenInfo() {
      return request<any>(
        "GET",
        `/api/routes/users/auth?action=time`
      );
    },

    // GET /api/routes/users/auth?action=verify&token=...
    async verifyToken(token?: string) {
      const tk = token || authToken;
      if (!tk) throw new Error("No token to verify");
      return request<any>(
        "GET",
        `/api/routes/users/auth?action=verify&token=${encodeURIComponent(tk)}`
      );
    },
  },

  mydUsers: {
    // POST /api/routes/users  (register)
    async create(payload: {
      name: string;
      email: string;
      password: string;
      role: string;
    }): Promise<User> {
      return request<User>("POST", "/api/routes/users", payload);
    },

    // GET /api/routes/users
    async getAll(): Promise<User[]> {
      return request<User[]>("GET", "/api/routes/users");
    },

    // GET /api/routes/users/:id
    async getById(id?: string): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>("GET", `/api/routes/users/${targetId}`);
    },

    // PUT /api/routes/users/:id
    async update(
      updates: { name?: string; email?: string },
      id?: string
    ): Promise<User> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<User>("PUT", `/api/routes/users/${targetId}`, updates);
    },

    // DELETE /api/routes/users/:id
    async remove(id?: string): Promise<{ message?: string }> {
      const targetId = id || userIdCache;
      if (!targetId) throw new Error("No userId provided");
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/users/${targetId}`
      );
    },

    // GET /api/routes/users/permissions
    async getPermissions(): Promise<string[]> {
      return request<string[]>(
        "GET",
        "/api/routes/users/permissions"
      );
    },
  },

  categories: {
    // POST /api/routes/category
    async create(payload: { name: string; description?: string }) {
      return request<Category>(
        "POST",
        "/api/routes/category",
        payload
      );
    },

    // GET /api/routes/category
    async getAll() {
      return request<Category[]>("GET", "/api/routes/category");
    },

    // GET /api/routes/category/:id
    async getById(id: string) {
      return request<Category>(
        "GET",
        `/api/routes/category/${id}`
      );
    },

    // PATCH /api/routes/category/:id
    async update(id: string, payload: { name?: string; description?: string }) {
      return request<Category>(
        "PATCH",
        `/api/routes/category/${id}`,
        payload
      );
    },

    // DELETE /api/routes/category/:id
    async remove(id: string) {
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/category/${id}`
      );
    },
  },

  companies: {
    // POST /api/routes/company
    async create(payload: {
      name: string;
      description?: string;
      address?: string;
      phone?: string;
      email?: string;
    }) {
      return request<Company>(
        "POST",
        "/api/routes/company",
        payload
      );
    },

    // GET /api/routes/company
    async getAll() {
      return request<Company[]>(
        "GET",
        "/api/routes/company"
      );
    },

    // GET /api/routes/company/:id
    async getById(id: string) {
      return request<Company>(
        "GET",
        `/api/routes/company/${id}`
      );
    },

    // PATCH /api/routes/company/:id
    async update(id: string, payload: Partial<Company>) {
      return request<Company>(
        "PATCH",
        `/api/routes/company/${id}`,
        payload
      );
    },

    // DELETE /api/routes/company/:id?hard=false
    async remove(id: string, hard = false) {
      const qs = `?hard=${hard ? "true" : "false"}`;
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/company/${id}${qs}`
      );
    },
  },

  manufacturers: {
    // POST /api/routes/manufacturer
    async create(payload: {
      name: string;
      description?: string;
      country?: string;
      website?: string;
    }) {
      return request<Manufacturer>(
        "POST",
        "/api/routes/manufacturer",
        payload
      );
    },

    // GET /api/routes/manufacturer
    async getAll() {
      return request<Manufacturer[]>(
        "GET",
        "/api/routes/manufacturer"
      );
    },

    // GET /api/routes/manufacturer/:id
    async getById(id: string) {
      return request<Manufacturer>(
        "GET",
        `/api/routes/manufacturer/${id}`
      );
    },

    // PATCH /api/routes/manufacturer/:id
    async update(id: string, payload: Partial<Manufacturer>) {
      return request<Manufacturer>(
        "PATCH",
        `/api/routes/manufacturer/${id}`,
        payload
      );
    },

    // DELETE /api/routes/manufacturer/:id?hard=false
    async remove(id: string, hard = false) {
      const qs = `?hard=${hard ? "true" : "false"}`;
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/manufacturer/${id}${qs}`
      );
    },
  },

  contacts: {
    // POST /api/routes/contacts
    async create(payload: {
      name: string;
      email?: string;
      phone?: string;
      company?: string;
      position?: string;
    }) {
      return request<Contact>(
        "POST",
        "/api/routes/contacts",
        payload
      );
    },

    // GET /api/routes/contacts
    async getAll() {
      return request<Contact[]>(
        "GET",
        "/api/routes/contacts"
      );
    },

    // GET /api/routes/contacts/:id
    async getById(id: string) {
      return request<Contact>(
        "GET",
        `/api/routes/contacts/${id}`
      );
    },

    // PATCH /api/routes/contacts/:id
    async update(id: string, payload: Partial<Contact>) {
      return request<Contact>(
        "PATCH",
        `/api/routes/contacts/${id}`,
        payload
      );
    },

    // DELETE /api/routes/contacts/:id
    async remove(id: string) {
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/contacts/${id}`
      );
    },
  },

  certifications: {
    // POST /api/routes/certifications
    async create(payload: {
      name: string;
      description?: string;
      issuer?: string;
      expiryDate?: string;
    }) {
      return request<Certification>(
        "POST",
        "/api/routes/certifications",
        payload
      );
    },

    // GET /api/routes/certifications
    async getAll() {
      return request<Certification[]>(
        "GET",
        "/api/routes/certifications"
      );
    },

    // GET /api/routes/certifications/:id
    async getById(id: string) {
      return request<Certification>(
        "GET",
        `/api/routes/certifications/${id}`
      );
    },

    // PATCH /api/routes/certifications/:id
    async update(id: string, payload: Partial<Certification>) {
      return request<Certification>(
        "PATCH",
        `/api/routes/certifications/${id}`,
        payload
      );
    },

    // DELETE /api/routes/certifications/:id
    async remove(id: string) {
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/certifications/${id}`
      );
    },
  },

  notes: {
    // POST /api/routes/notes
    async create(payload: {
      title: string;
      content: string;
      category?: string;
      priority?: string;
    }) {
      return request<Note>(
        "POST",
        "/api/routes/notes",
        payload
      );
    },

    // GET /api/routes/notes
    async getAll() {
      return request<Note[]>(
        "GET",
        "/api/routes/notes"
      );
    },

    // GET /api/routes/notes/:id
    async getById(id: string) {
      return request<Note>(
        "GET",
        `/api/routes/notes/${id}`
      );
    },

    // PATCH /api/routes/notes/:id
    async update(id: string, payload: Partial<Note>) {
      return request<Note>(
        "PATCH",
        `/api/routes/notes/${id}`,
        payload
      );
    },

    // DELETE /api/routes/notes/:id
    async remove(id: string) {
      return request<{ message?: string }>(
        "DELETE",
        `/api/routes/notes/${id}`
      );
    },
  },

  admin: {
    // GET /api/admin/clean-indexes
    async checkIndexes() {
      return request<any>("GET", "/api/admin/clean-indexes");
    },

    // GET /api/admin/clean-indexes?action=problematic
    async checkProblematic() {
      return request<any>(
        "GET",
        "/api/admin/clean-indexes?action=problematic"
      );
    },

    // POST /api/admin/clean-indexes
    async clean() {
      return request<any>("POST", "/api/admin/clean-indexes");
    },

    // PUT /api/admin/clean-indexes
    async recreateIndexes() {
      return request<any>("PUT", "/api/admin/clean-indexes");
    },
  },
};

// También exportamos helpers para que puedas usarlos en hooks
export const session = {
  getToken: () => authToken,
  setToken: setAuthToken,
  getUserId: () => userIdCache,
  setUserId,
};
