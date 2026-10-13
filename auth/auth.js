// MySubis — pages de confirmation d'e-mail et de réinitialisation du mot de passe.
//
// Sécurité (voir aussi la CSP de chaque page) :
// - Aucune bibliothèque tierce : appels directs à l'API Auth de Supabase (fetch).
// - Les jetons sont lus dans l'URL puis immédiatement effacés de la barre d'adresse et de
//   l'historique ; ils ne vivent qu'en mémoire (jamais localStorage / cookies).
// - Le jeton à usage unique (token_hash) n'est consommé qu'au moment de l'action : les
//   scanners de liens des messageries (qui ouvrent les pages sans exécuter le JS) ne le grillent pas.
// - Aucun texte issu de l'URL ou de l'API n'est inséré dans la page : uniquement des
//   messages prédéfinis, posés avec textContent (pas d'innerHTML → pas d'injection).
// - La session ouverte par le lien est révoquée juste après l'opération.
(function () {
  'use strict';

  var cfg = window.MYSUBIS_AUTH_CONFIG;
  var page = document.body.getAttribute('data-page');

  // --- Anti-clickjacking : la page ne doit jamais s'afficher dans un cadre ---
  if (window.top !== window.self) {
    document.body.textContent = '';
    try { window.top.location = window.self.location.href; } catch (e) { /* cadre d'origine différente */ }
    return;
  }
  document.documentElement.classList.add('auth-ready');

  // --- Lecture puis effacement immédiat des paramètres sensibles ---
  var query = new URLSearchParams(window.location.search);
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  var params = {
    tokenHash: query.get('token_hash'),
    type: query.get('type') || hash.get('type'),
    accessToken: hash.get('access_token'),
    errorCode: query.get('error_code') || hash.get('error_code') || query.get('error') || hash.get('error'),
  };
  try { window.history.replaceState(null, '', window.location.pathname); } catch (e) {}

  var TOKEN_HASH_RE = /^[A-Za-z0-9_-]{8,256}$/;
  var JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  if (params.tokenHash && !TOKEN_HASH_RE.test(params.tokenHash)) params.tokenHash = null;
  if (params.accessToken && (params.accessToken.length > 4096 || !JWT_RE.test(params.accessToken))) params.accessToken = null;

  // --- Messages (FR / EN), jamais construits à partir de l'URL ---
  var MSG = {
    verifying: ['Vérification en cours…', 'Verifying…'],
    confirmed: ['Votre adresse e-mail est confirmée. Vous pouvez retourner dans MySubis et vous connecter.', 'Your email address is confirmed. You can go back to MySubis and sign in.'],
    expired: ['Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau depuis l’app.', 'This link has expired or was already used. Request a new one from the app.'],
    invalid: ['Ce lien est invalide ou incomplet. Ouvrez le dernier e-mail reçu, ou demandez un nouveau lien depuis l’app.', 'This link is invalid or incomplete. Open the latest email you received, or request a new link from the app.'],
    network: ['Connexion impossible. Vérifiez votre réseau et réessayez.', 'Could not connect. Check your network and try again.'],
    generic: ['Une erreur est survenue. Réessayez dans un instant.', 'Something went wrong. Please try again in a moment.'],
    tooShort: ['Le mot de passe doit contenir au moins 8 caractères.', 'Your password must be at least 8 characters.'],
    tooLong: ['Le mot de passe ne peut pas dépasser 72 caractères.', 'Your password cannot exceed 72 characters.'],
    mismatch: ['Les deux mots de passe ne correspondent pas.', 'The two passwords don’t match.'],
    weak: ['Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié.', 'This password is too weak. Choose a longer or more varied one.'],
    same: ['Le nouveau mot de passe doit être différent de l’ancien.', 'The new password must be different from the old one.'],
    rate: ['Trop de tentatives. Patientez quelques minutes puis réessayez.', 'Too many attempts. Wait a few minutes and try again.'],
    saving: ['Enregistrement…', 'Saving…'],
    updated: ['Votre mot de passe a été modifié. Retournez dans MySubis et connectez-vous avec le nouveau.', 'Your password has been changed. Go back to MySubis and sign in with the new one.'],
  };

  /** Affiche un message prédéfini dans les deux langues (le site masque celle qui n'est pas active). */
  function setMessage(el, key, tone) {
    var m = MSG[key] || MSG.generic;
    el.textContent = '';
    ['lang-fr', 'lang-en'].forEach(function (cls, i) {
      var span = document.createElement('span');
      span.className = cls;
      span.textContent = m[i];
      el.appendChild(span);
    });
    el.setAttribute('data-tone', tone || 'neutral');
    el.hidden = false;
  }

  /** Erreurs de l'API → clé de message (liste blanche). */
  function errorKey(status, body) {
    var code = body && (body.error_code || body.code || body.error);
    if (status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit') return 'rate';
    if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'bad_jwt' || code === 'session_not_found' || code === 'access_denied' || status === 401 || status === 403) return 'expired';
    if (code === 'same_password') return 'same';
    if (code === 'weak_password') return 'weak';
    if (status === 400 || status === 422) return 'invalid';
    return 'generic';
  }

  function api(path, opts) {
    var headers = { 'apikey': cfg.anonKey, 'Content-Type': 'application/json' };
    if (opts.token) headers['Authorization'] = 'Bearer ' + opts.token;
    return fetch(cfg.url + '/auth/v1' + path, {
      method: opts.method || 'POST',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      redirect: 'error',
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) { var err = new Error('api'); err.status = res.status; err.body = data; throw err; }
        return data;
      });
    });
  }

  /** Révoque la session ouverte par le lien (pas de session web qui traîne). */
  function revoke(token) {
    if (!token) return Promise.resolve();
    return api('/logout', { token: token }).catch(function () {});
  }

  function failKey(err) {
    if (err && err.message === 'api') return errorKey(err.status, err.body);
    return 'network';
  }

  if (!cfg || typeof cfg.url !== 'string' || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(cfg.url) || typeof cfg.anonKey !== 'string') {
    var box = document.getElementById('status');
    if (box) setMessage(box, 'generic', 'error');
    return;
  }

  // ===================== Confirmation d'e-mail =====================
  if (page === 'confirm') {
    var status = document.getElementById('status');
    var openApp = document.getElementById('open-app');
    var CONFIRM_TYPES = { email: 1, signup: 1, email_change: 1 };

    var done = function () {
      setMessage(status, 'confirmed', 'success');
      document.body.setAttribute('data-state', 'success');
      openApp.hidden = false;
    };

    if (params.errorCode) {
      setMessage(status, params.errorCode === 'otp_expired' || params.errorCode === 'access_denied' ? 'expired' : 'invalid', 'error');
    } else if (params.tokenHash && CONFIRM_TYPES[params.type]) {
      // Lien token_hash : la confirmation est faite ici, au chargement par un vrai navigateur.
      setMessage(status, 'verifying');
      api('/verify', { body: { type: params.type === 'signup' ? 'email' : params.type, token_hash: params.tokenHash } })
        .then(function (session) {
          params.tokenHash = null;
          return revoke(session && session.access_token);
        })
        .then(done)
        .catch(function (err) { setMessage(status, failKey(err), 'error'); });
    } else if (params.accessToken && CONFIRM_TYPES[params.type]) {
      // Ancien format (#access_token) : Supabase a déjà confirmé l'adresse avant la redirection.
      var token = params.accessToken;
      params.accessToken = null;
      revoke(token).then(done);
    } else {
      setMessage(status, 'invalid', 'error');
    }
    return;
  }

  // ===================== Réinitialisation du mot de passe =====================
  if (page === 'reset') {
    var form = document.getElementById('reset-form');
    var pwd = document.getElementById('password');
    var confirmInput = document.getElementById('password-confirm');
    var submit = document.getElementById('submit');
    var formStatus = document.getElementById('status');
    var success = document.getElementById('success');
    var openAppBtn = document.getElementById('open-app');

    var hasLink = (params.tokenHash && params.type === 'recovery') || (params.accessToken && params.type === 'recovery');
    if (params.errorCode || !hasLink) {
      form.hidden = true;
      setMessage(formStatus, params.errorCode === 'otp_expired' ? 'expired' : 'invalid', 'error');
      return;
    }

    // Jeton de session de récupération : obtenu au 1er envoi, conservé en mémoire pour un nouvel essai.
    var recoveryToken = params.accessToken;
    var pendingHash = params.tokenHash;
    params.accessToken = null;
    params.tokenHash = null;
    var busy = false;

    document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var visible = pwd.type === 'text';
        pwd.type = confirmInput.type = visible ? 'password' : 'text';
        btn.setAttribute('aria-pressed', visible ? 'false' : 'true');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      var value = pwd.value;
      if (value.length < 8) return setMessage(formStatus, 'tooShort', 'error');
      if (value.length > 72) return setMessage(formStatus, 'tooLong', 'error');
      if (value !== confirmInput.value) return setMessage(formStatus, 'mismatch', 'error');

      busy = true;
      submit.disabled = true;
      setMessage(formStatus, 'saving');

      var getToken = recoveryToken
        ? Promise.resolve(recoveryToken)
        : api('/verify', { body: { type: 'recovery', token_hash: pendingHash } }).then(function (session) {
            pendingHash = null;
            if (!session || typeof session.access_token !== 'string') { var err = new Error('api'); err.status = 400; throw err; }
            recoveryToken = session.access_token;
            return recoveryToken;
          });

      getToken
        .then(function (token) { return api('/user', { method: 'PUT', token: token, body: { password: value } }); })
        .then(function () {
          var token = recoveryToken;
          recoveryToken = null;
          pwd.value = confirmInput.value = '';
          return revoke(token);
        })
        .then(function () {
          form.hidden = true;
          formStatus.hidden = true;
          setMessage(success, 'updated', 'success');
          document.body.setAttribute('data-state', 'success');
          openAppBtn.hidden = false;
        })
        .catch(function (err) {
          var key = failKey(err);
          setMessage(formStatus, key, 'error');
          if (key === 'expired' || (!recoveryToken && !pendingHash)) form.hidden = true;
        })
        .then(function () { busy = false; submit.disabled = false; });
    });
  }
})();
