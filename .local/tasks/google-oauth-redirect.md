# تبديل تسجيل الدخول بجوجل إلى OAuth Redirect

  ## What & Why
  تغيير طريقة تسجيل الدخول بجوجل من GSI popup (التي تتطلب Authorized JavaScript origins) إلى OAuth 2.0 redirect flow (التي تعتمد على Authorized redirect URIs فقط). هذا يحل مشكلة عدم عمل تسجيل الدخول بجوجل على الموقع المنشور.

  ## Done looks like
  - زر "تسجيل الدخول بجوجل" في صفحة Login يعيد توجيه المستخدم إلى صفحة جوجل مباشرة
  - بعد الموافقة، يعود جوجل للمستخدم إلى /api/auth/google/callback تلقائياً ويسجل دخوله
  - يعمل بدون Authorized JavaScript origins — فقط Authorized redirect URIs
  - يعمل على tuwaiqassociation.sa وكذلك في بيئة التطوير

  ## Out of scope
  - تغيير باقي آليات التسجيل (الجوال + كلمة المرور)
  - تغيير صلاحيات المستخدم أو بياناته

  ## Tasks
  1. تثبيت حزمة passport-google-oauth20 وأنواع TypeScript الخاصة بها.

  2. إعداد Google OAuth Strategy في الخادم بـ GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET وcallback URL. إضافة مسار GET /api/auth/google لبدء الـ redirect ومسار GET /api/auth/google/callback لاستقبال رد جوجل وتسجيل دخول المستخدم ثم توجيهه للصفحة الرئيسية. استخدام نفس منطق إنشاء/البحث عن المستخدم الموجود. متغير GOOGLE_CALLBACK_URL يُبنى من VITE_APP_URL أو BASE_URL.

  3. حذف مكوّن GoogleSignInButton والسكريبت GSI من index.html. استبدالهما بزر يوجّه المستخدم مباشرة إلى /api/auth/google.

  4. إضافة GOOGLE_CLIENT_SECRET إلى Secrets الخاصة بالمشروع.

  ## Relevant files
  - `server/routes.ts:96-215`
  - `client/src/pages/Login.tsx:162-340`
  - `client/index.html:38`
  