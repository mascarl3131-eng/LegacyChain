# Activation de LegacyChain Premium

Le code du paiement est intégré. Trois secrets doivent encore être ajoutés aux environnements
`Production` et `Preview` de Vercel :

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## 1. Supabase

Exécuter le fichier suivant dans le SQL Editor du projet Supabase :

`supabase/migrations/20260620_premium_entitlements.sql`

Copier ensuite la clé `service_role` depuis les paramètres API du projet et l’ajouter à Vercel
sous le nom `SUPABASE_SERVICE_ROLE_KEY`. Cette clé ne doit jamais commencer par `VITE_`.

## 2. Stripe

Ajouter la clé secrète Stripe à Vercel sous le nom `STRIPE_SECRET_KEY`.

Créer un endpoint webhook Stripe :

`https://legacy-chain-mascarl3131-engs-projects.vercel.app/api/stripe-webhook`

Événements à écouter :

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `refund.created` (ou `charge.refunded` si proposé)
- `charge.dispute.created`

Copier le secret de signature du webhook dans `STRIPE_WEBHOOK_SECRET`.

## 3. Prix

Le prix est actuellement configuré à **10 USD, paiement unique** :

- `PREMIUM_PRICE_CENTS=1000`
- `PREMIUM_CURRENCY=usd`

Une modification de ces deux variables change le prix du prochain Checkout sans changement de code.

## 4. Vérification

Après ajout des secrets et exécution de la migration :

1. déployer sur Vercel ;
2. se connecter avec Google ;
3. ouvrir Premium et effectuer un paiement Stripe en mode test ;
4. vérifier que `premium_entitlements.status` vaut `active` ;
5. se déconnecter puis se reconnecter : Premium doit rester actif.
