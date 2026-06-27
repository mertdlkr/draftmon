# MonaDraft — Master Software Design Document
> **Version:** 3.0 — Finalized for Monad Hackathon (Web2-Casual Build)
> **Last updated:** 2026-06-27

---

## 1. Product Overview

### 1.1 Ne yapıyor?

QR tabanlı oda sistemiyle çalışan, on-chain entry ve bet mekanizması olan bir futbol taslak (draft) turnuvası platformu.

**Oyuncu (Player):** QR okutarak odaya katılır, entry fee öder (MON), 60 saniyede kendi takımını draft eder, turnuva simüle edilir, kazanan tüm entry pool'u alır.

**Bahisçi (Bettor):** Odaya katılmak zorunda değil. Kadrolar açıklandıktan sonra 60 saniyelik betting window'da istediği oyuncunun kazanacağına MON ile bet atar. Turnuva bitince doğru tahminde bulunanlar orantılı pay alır.

**Admin:** Odayı oluşturur, QR paylaşır, draft'ı başlatır, sim tetikler, ödülleri dağıtır.

### 1.2 On-chain ne, off-chain ne?

| Katman | Ne yapıyor |
|---|---|
| **Solidity (on-chain)** | Entry fee toplama, bet pool toplama, ödül dağıtımı |
| **Next.js API Routes (off-chain)** | Oda yönetimi, draft akışı, sim engine, Supabase okuma/yazma, tx verify |
| **Supabase (off-chain)** | rooms, players, matches, bets, leaderboard — tüm oyun state'i |
| **Frontend (client)** | Cüzdan bağlama, contract call tetikleme, draft UI, replay, bracket |

Blockchain sadece para hareketlerinde devreye girer. Kazanan off-chain belirlenir (sim sonucu); admin contract'ı çağırır, para dağılır.

### 1.3 Tam Kullanıcı Akışları

**Admin akışı:**
```
/admin
  → "Yeni Oda Oluştur" → kapasite seç (4 / 8 / 16), entry fee gir
  → POST /api/rooms → Supabase'e kayıt + createRoom(contractRoomId, entryFee) tx
  → QR ekranda gösterilir — oyuncular okutup gelir
  → Oyuncular dolunca "Draft Başlat" butonu aktifleşir
  → Admin tıklar → POST /api/rooms/[roomId]/start-draft → tüm oyuncular draft'a düşer
  → Admin ekranı: tüm oyuncuların kadroları anlık oluşuyor (saha dizilimi)
  → Kadrolar hazır → 60s betting window başlar (otomatik, sayaç gösterilir)
  → Betting window biter → "Sim Başlat" butonu
  → Admin tıklar → POST /api/sim → sim anında çalışır, tüm sonuçlar Supabase'e yazılır
  → Frontend maçları sırayla oynatır (replay animasyonu)
  → Final maçı biter → kazanan açıklanır
  → Admin "Ödülleri Dağıt" → POST /api/payout → declareWinner + distributeBetWinners tx
  → Sonuç ekranı: sıralama, kazanılan MON
```

**Oyuncu akışı:**
```
QR tara → /join/[roomId]
  → Cüzdan bağla (RainbowKit)
  → TournamentPool.enter(contractRoomId) — entry fee öde
  → tx confirm → POST /api/join {roomId, wallet, txHash} → Supabase'e kayıt
  → /lobby/[roomId] — bekleme ekranı (diğer oyuncular gelinceye kadar)
      → Anlık oyuncu sayısı gösterilir (SWR polling veya Supabase realtime)
  → Admin draft başlatınca → /draft/[roomId] sayfasına yönlendirilir
  → 60s içinde position-by-position takımı kur
  → Kadro onaylanınca → /watch/[roomId] — replay + bracket izleme
```

**Bahisçi akışı:**
```
/rooms → açık odaları gör
  → /watch/[roomId] — draft sırasında kadrolar oluşuyor (canlı)
  → Betting window açılınca (kadrolar hazır) → bet formu görünür
  → Oyuncu seç → miktar gir
  → TournamentPool.placeBet(contractRoomId, targetWallet) — bet öde
  → tx confirm → POST /api/bet → Supabase'e kayıt
  → Maç replayleri başlar, bahisçi sonucu izler
  → Sonuç: bahsi kazandıysa MON geldi
```

---

## 2. Tech Stack

```
Framework:        Next.js 14 (App Router), TypeScript strict
Styling:          Tailwind CSS v3
Database:         Supabase (Postgres) — hosted, zero infra
Smart Contracts:  Foundry (Solidity ^0.8.24) — TournamentPool.sol
Web3 Layer:       wagmi v2, viem, RainbowKit
State (client):   Zustand (draft UI state), SWR (data fetching / polling)
QR:               qrcode.react (oluştur), html5-qrcode (tara, mobil)
Deployment:       Vercel (frontend + API routes) + Monad Testnet (contract)
Package Manager:  pnpm
```

---

## 3. Proje Klasör Yapısı

```
monadraft/
│
├── frontend/                                        # Next.js uygulaması
│   └── src/
│       ├── app/
│       │   ├── layout.tsx                           # Root: WagmiProvider, RainbowKit, QueryClient
│       │   ├── page.tsx                             # Landing page
│       │   │
│       │   ├── admin/
│       │   │   └── page.tsx                         # YENİ: Oda oluştur, QR üret, draft başlat, sim tetikle, ödül dağıt
│       │   │
│       │   ├── rooms/
│       │   │   └── page.tsx                         # YENİ: Açık odalar listesi (bahisçiler için)
│       │   │
│       │   ├── join/
│       │   │   └── [roomId]/
│       │   │       └── page.tsx                     # YENİ: QR hedefi — entry fee öde, bekleme
│       │   │
│       │   ├── lobby/
│       │   │   └── [roomId]/
│       │   │       └── page.tsx                     # YENİ: Bekleme ekranı (oyuncular toplanıyor)
│       │   │
│       │   ├── draft/
│       │   │   └── [roomId]/
│       │   │       └── page.tsx                     # YENİ: Draft UI — 60s, position-by-position
│       │   │
│       │   ├── watch/
│       │   │   └── [roomId]/
│       │   │       └── page.tsx                     # YENİ: Kadro ekranı + betting + replay + bracket (herkes için)
│       │   │
│       │   └── api/
│       │       ├── rooms/
│       │       │   ├── route.ts                     # GET: liste, POST: oda oluştur
│       │       │   └── [roomId]/
│       │       │       ├── route.ts                 # GET: oda detayı + oyuncular + kadrolar
│       │       │       └── start-draft/
│       │       │           └── route.ts             # POST: draft phase başlat (admin only)
│       │       ├── join/
│       │       │   └── route.ts                     # POST: entry tx verify → players insert
│       │       ├── draft/
│       │       │   └── route.ts                     # POST: kadro kaydet
│       │       ├── bet/
│       │       │   ├── route.ts                     # POST: bet tx verify → bets insert
│       │       │   └── [roomId]/
│       │       │       └── route.ts                 # GET: odanın tüm betleri
│       │       ├── sim/
│       │       │   └── route.ts                     # POST: sim engine çalıştır (admin secret)
│       │       └── payout/
│       │           └── route.ts                     # POST: declareWinner + distributeBetWinners tx
│       │
│       ├── components/
│       │   ├── ui/                                  # Mevcut — kullanılmaya devam
│       │   │   ├── PixelStatBar.tsx
│       │   │   ├── PixelSlider.tsx
│       │   │   ├── ManagerAvatar.tsx
│       │   │   └── PixelSelect.tsx
│       │   │
│       │   ├── layout/
│       │   │   ├── Nav.tsx                          # Mevcut
│       │   │   └── PageHeader.tsx                   # Mevcut
│       │   │
│       │   ├── home/                                # Mevcut — dokunulmaz
│       │   │   ├── PixelCursor.tsx
│       │   │   ├── ScrollReveal.tsx
│       │   │   └── StatsRow.tsx
│       │   │
│       │   ├── draft/                               # YENİ — draft UI bileşenleri
│       │   │   ├── DraftPhase.tsx                   # Tek mevki fazı (10 kart grid)
│       │   │   ├── PlayerCard.tsx                   # Oyuncu kartı (isim, mevki, istatistikler)
│       │   │   ├── DraftTimer.tsx                   # 60s geri sayım, shared countdown
│       │   │   ├── PositionProgress.tsx             # Hangi fazdasın, kaç slot dolu
│       │   │   └── SquadSummary.tsx                 # Sağda özet — seçilen oyuncular
│       │   │
│       │   ├── room/                                # YENİ — oda / lobby bileşenleri
│       │   │   ├── QRDisplay.tsx                    # qrcode.react ile QR üret
│       │   │   ├── QRScanner.tsx                    # html5-qrcode ile mobil okuma
│       │   │   ├── PlayerList.tsx                   # Odadaki oyuncular canlı listesi
│       │   │   └── RoomStatusBadge.tsx              # open / drafting / betting / sim / finished
│       │   │
│       │   ├── watch/                               # YENİ — izleme ekranı bileşenleri
│       │   │   ├── SquadRevealGrid.tsx              # Tüm kadrolar saha dizilimi ile (betting window)
│       │   │   ├── BetForm.tsx                      # Oyuncu seç + miktar + onayla
│       │   │   ├── BettingCountdown.tsx             # 60s betting window sayacı
│       │   │   └── PayoutSummary.tsx                # Kazanılan MON gösterimi
│       │   │
│       │   ├── tournaments/                         # MEVCUT — büyük ölçüde kullanılmaya devam
│       │   │   ├── MatchBracket.tsx                 # KULLANILACAK — turnuva ağacı
│       │   │   ├── MatchReplay.tsx                  # KULLANILACAK — maç animasyonu
│       │   │   ├── AnimatedPitch.tsx                # KULLANILACAK — hareketli saha
│       │   │   ├── EventTicker.tsx                  # KULLANILACAK — maç olayları bandı
│       │   │   ├── ReplayControls.tsx               # KULLANILACAK — hız / duraklat
│       │   │   ├── FootballPitch.tsx                # KULLANILACAK — saha SVG
│       │   │   └── TournamentSpectator.tsx          # ADAPT EDİLECEK — kadro dizilim görünümü
│       │   │
│       │   ├── agents/                              # SİLİNECEK — AI persona konsepti kalktı
│       │   │   ├── AgentCard.tsx                    # SİL
│       │   │   ├── ManagersGrid.tsx                 # SİL
│       │   │   └── SquadTable.tsx                   # OPSIYONEL — SquadSummary olarak adapt edilebilir
│       │   │
│       │   ├── live/                                # ADAPT EDİLECEK
│       │   │   ├── LiveLobbyGrid.tsx                # → SquadRevealGrid için referans alınabilir
│       │   │   ├── LiveTournamentCard.tsx           # → RoomCard olarak adapt et
│       │   │   └── ParticipantCard.tsx              # → PlayerCard (draft) için referans
│       │   │
│       │   └── bazaar/
│       │       └── PlayerBazaar.tsx                 # KULLANILACAK — oyuncu pool gösterimi için referans
│       │
│       ├── hooks/
│       │   ├── useEnterRoom.ts                      # YENİ: useWriteContract → enter(contractRoomId)
│       │   ├── usePlaceBet.ts                       # YENİ: useWriteContract → placeBet(contractRoomId, target)
│       │   ├── useRoom.ts                           # YENİ: SWR → /api/rooms/[roomId] (3s polling)
│       │   ├── useDraft.ts                          # YENİ: draft state + POST /api/draft
│       │   ├── useBets.ts                           # YENİ: SWR → /api/bet/[roomId]
│       │   └── useLiveTournament.ts                 # MEVCUT — review et, Supabase realtime'a adapt et
│       │
│       └── lib/
│           ├── supabase.ts                          # YENİ: createClient singleton (server + anon)
│           ├── wagmi.ts                             # MEVCUT — monadTestnet chain def (dokunma)
│           ├── viem-client.ts                       # YENİ: publicClient singleton (tx verify)
│           │
│           ├── simulation/                          # MEVCUT — büyük ölçüde kullanılmaya devam
│           │   ├── engine.ts                        # KULLANILACAK — simulateMatch() ana fonksiyon
│           │   ├── types.ts                         # KULLANILACAK — MatchEvent, MatchTick, SimInput
│           │   ├── seeder.ts                        # KULLANILACAK — SeededRNG, createSeed
│           │   ├── tactics.ts                       # KULLANILACAK — getTactic (strateji auto-assign)
│           │   ├── positions.ts                     # KULLANILACAK — buildFormationPositions
│           │   └── index.ts                         # KULLANILACAK
│           │
│           ├── contracts/
│           │   ├── abi.ts                           # GÜNCELLENECEK — TournamentPool ABI
│           │   ├── types.ts                         # SIFIRLANACAK — Room, Player, Bet, Match tipleri
│           │   ├── queries.ts                       # SIFIRLANACAK — on-chain agent okuma kalkıyor
│           │   ├── strategies.ts                    # SİLİNECEK — agent strateji mantığı kalkıyor
│           │   ├── client.ts                        # GÜNCELLENECEK — TournamentPool client
│           │   └── index.ts                         # GÜNCELLENECEK
│           │
│           ├── constants/
│           │   ├── squad.ts                         # KULLANILACAK — POS_ORDER, POS_GROUP, GROUP_LABEL, statDots
│           │   └── theme.ts                         # KULLANILACAK
│           │
│           ├── sim-engine.ts                        # YENİ: server-only, /api/sim'den çağrılır
│           │                                        #   runTournamentSim(roomId) → winner wallet
│           ├── payout.ts                            # YENİ: calculateBetPayouts, contract call builder
│           ├── draft-pool.ts                        # YENİ: getDraftPool(position, n) → random player cards
│           │
│           └── utils/
│               ├── format.ts                        # KULLANILACAK — formatMON, shortenAddress
│               └── retry.ts                         # KULLANILACAK
│
└── contracts/
    ├── src/
    │   └── TournamentPool.sol                       # YENİ: entry fee + bet pool (aşağıda tam kod)
    ├── test/
    │   └── TournamentPool.t.sol                     # YENİ: tüm testler
    ├── script/
    │   └── DeployTournamentPool.s.sol               # YENİ: deploy script
    └── foundry.toml
```

---

## 4. Oda Sistemi

### 4.1 Oda Özellikleri

| Alan | Değer |
|---|---|
| Kapasite | 4, 8, veya 16 (admin seçer, sabit) |
| Entry fee | Admin belirler (MON, wei cinsinden) |
| Bettor kapasitesi | Sınırsız |
| QR içeriği | `https://[domain]/join/[roomId]` |
| QR üzerinde gösterim | Odadaki oyuncu sayısı / kapasite + aktif bettor sayısı |

### 4.2 Oda Durumları (Room Status)

```
open       → Entry açık, oyuncular geliyor
drafting   → Admin draft başlattı, oyuncular takım kuruyor (60s)
betting    → Kadrolar hazır, betting window açık (60s)
simulating → Admin sim tetikledi, maçlar hesaplandı, replay oynatılıyor
finished   → Tüm maçlar oynatıldı, ödüller dağıtıldı
```

### 4.3 Oda Geçiş Koşulları

```
open → drafting:   oyuncu sayısı == kapasite && admin "Draft Başlat" tıklar
drafting → betting: tüm oyuncular draft_done=true || 60s timer bitti
betting → simulating: 60s betting timer bitti && admin "Sim Başlat" tıklar
simulating → finished: ödüller dağıtıldı (declareWinner + distributeBetWinners tx)
```

---

## 5. Draft Sistemi

### 5.1 Genel Kurallar

- **Bağımsız havuz:** Her oyuncu kendi 10 random kartını görür. Aynı futbolcu birden fazla takımda olabilir.
- **Eş zamanlı:** Tüm oyuncular aynı anda aynı fazı görür.
- **60 saniye shared sayaç:** Tek bir geri sayım tüm fazlara yayılır. Süre dolunca boş slotlar random doldurulur.
- **Sıra:** ATT → MID → DEF → GK

### 5.2 Mevki Fazları

| Faz | Mevkiler | Min Seçim | Max Seçim | Gösterilen Kart |
|---|---|---|---|---|
| ATT | ST, LW, RW | 1 | 4 | 10 random |
| MID | CM, CDM, CAM | 2 | 4 | 10 random |
| DEF | CB, LB, RB | 3 | 6 | 10 random |
| GK | GK | 1 | 1 | 3 random |

**Toplam: 11 oyuncu (1 GK + 10 field player)**

### 5.3 Dinamik Slot Kısıtı

Önceki fazlarda seçilen oyuncu sayısı, sonraki fazların max slotunu kısıtlar.

```
field_remaining = 10 - att_picked - mid_picked - def_picked

ATT fazı başında: def ve mid için rezerve bırak → max_att = min(4, field_remaining - 2 - 3) = 5 (ama max 4)
MID fazı başında: max_mid = min(4, field_remaining - def_min) = min(4, remaining - 3)
DEF fazı başında: max_def = min(6, field_remaining) ve min_def = max(3, field_remaining - 0)
  → Pratikte: def = 10 - att_picked - mid_picked
```

Örnek:
- ATT = 4, MID = 4 → DEF = 2 (minimum 3'ün altında → sistem MID'de max 3'e kısıtlar)
- ATT = 1, MID = 2 → DEF = 7 (max 6 olduğu için DEF = 6, ve 1 slot boş kalır → random doldurulur)

Bu kısıtlar `lib/draft-pool.ts`'teki `getSlotConstraints()` fonksiyonuyla hesaplanır.

### 5.4 Timer Davranışı

```
draft_started_at: timestamp (Supabase'e yazılır)
Timer = 60 - (now - draft_started_at) saniye

Timer = 0 → unfilled slotlar için random pick:
  - Her boş slot için getDraftPool(position, 1) çağrılır
  - Sonuç kadro olarak kaydedilir (draft_done = true)

Oyuncu daha önce onaylarsa (tüm 11 slot dolu) → anında draft_done = true
```

### 5.5 Draft UI Akışı (`/draft/[roomId]`)

```
Sayfa yüklenince:
  1. SWR ile /api/rooms/[roomId] → room.status === 'drafting' kontrol et
  2. draft_started_at'i çek → client-side sayacı başlat
  3. getDraftPool('ATT', 10) → ilk 10 kart göster

ATT fazı:
  → 10 kart grid'de gösterilir
  → Kullanıcı 1-4 kart seçer (seçilenler highlight, diğerleri soluk)
  → "Onayla" butonu (min 1 seçilmişse aktif)
  → Onaylayınca → MID fazına geç (sayaç durmaz)

MID, DEF fazları aynı şekilde

GK fazı:
  → 3 kart gösterilir
  → Birini seç → "Kadroyu Tamamla"
  → POST /api/draft { roomId, wallet, squadJson }
  → /watch/[roomId]'e yönlendir
```

### 5.6 Oyuncu Havuzu (`lib/draft-pool.ts`)

Mevcut `lib/contracts/types.ts`'teki `Player` tipi kullanılır:
```typescript
interface Player {
  name: string
  position: string   // ST, LW, RW, CM, CDM, CAM, CB, LB, RB, GK
  pace: number       // 0-100
  shooting: number   // 0-100
  passing: number    // 0-100
  tackling: number   // 0-100
}
```

`getDraftPool(group: 'ATT' | 'MID' | 'DEF' | 'GK', count: number): Player[]`
- `lib/constants/squad.ts`'teki `POS_GROUP` mapping'ini kullanarak filtreleme yapar
- `count` adet random oyuncu döner (shuffle + slice)
- Her çağrıda farklı sonuç (Math.random ile shuffle — seed'siz, bağımsız havuz)

---

## 6. Watch / İzleme Ekranı (`/watch/[roomId]`)

Bu sayfa **herkes** için aynı URL'de ama içerik room state'e göre değişir.

### 6.1 Durum → İçerik Mapping

| Room Status | Görüntülenen İçerik |
|---|---|
| `open` | Bekleme: "X/16 oyuncu katıldı" |
| `drafting` | Canlı kadro oluşumu: tüm oyuncuların saha dizilimi (partial — gelendikçe güncellenir) |
| `betting` | Tüm kadrolar açık (saha dizilimi) + bet formu + 60s sayaç |
| `simulating` | Maç replayleri sırayla + bracket güncelleniyor |
| `finished` | Son sıralama + kazanılan MON |

### 6.2 Kadro Gösterimi (Drafting + Betting aşaması)

Mevcut `TournamentSpectator.tsx` ve `AnimatedPitch.tsx`'i **adapt et**:
- Her oyuncu için küçük bir saha kartı (formations üzerinde oyuncu isimleri)
- draft_done=true olan oyuncuların kartı yeşil border ile highlight
- Gerçek zamanlı güncelleme: SWR 3s polling veya Supabase Realtime

### 6.3 Maç Replay Akışı

Sim tamamlandıktan sonra frontend'e tüm match sonuçları gelir. Maçlar **sırayla** oynatılır:

```
4 oyuncu:  SF1 → SF2 → Final          (3 maç)
8 oyuncu:  QF1 → QF2 → QF3 → QF4 → SF1 → SF2 → Final   (7 maç)
16 oyuncu: R16 (8 maç) → QF (4 maç) → SF (2 maç) → Final  (15 maç)
```

Her maç için:
1. `MatchBracket.tsx` — mevcut maç highlight edilir
2. `MatchReplay.tsx` + `AnimatedPitch.tsx` — maç animasyonu oynatılır
3. `EventTicker.tsx` — olaylar listesi
4. `ReplayControls.tsx` — hız kontrolü (1x / 2x / 4x)
5. Maç biter → bracket güncellenir → sonraki maç başlar

**Önemli:** Sim sonuçları deterministik ve anında hesaplanır. Replay sadece dramayı kurar — gerçek sonuç zaten Supabase'de.

---

## 7. Sim Engine

### 7.1 Mevcut Engine Adaptasyonu

`frontend/src/lib/simulation/engine.ts` dosyası **korunur**. `simulateMatch(input: SimInput)` fonksiyonu çağrılmaya devam eder.

Değişen tek şey: eski yapıda `strategyId` ve `AgentProfile` gerekirdi. Yeni yapıda bunlar **otomatik assign** edilir:

```typescript
// lib/sim-engine.ts (server-only)
function autoStrategy(squad: Player[]): number {
  const attCount = squad.filter(p => ['ST','LW','RW'].includes(p.position)).length
  const defCount = squad.filter(p => ['CB','LB','RB'].includes(p.position)).length
  const midCount = squad.filter(p => ['CM','CDM','CAM'].includes(p.position)).length

  if (attCount >= 3) return 3  // Counter Attack
  if (defCount >= 5) return 4  // Park the Bus
  if (midCount >= 4) return 2  // Possession
  return 1                     // High Press (default)
}

const defaultAgent = { attack: 15, defense: 15, discipline: 15 }
```

### 7.2 Turnuva Sim Fonksiyonu

`lib/sim-engine.ts`:
```typescript
export async function runTournamentSim(roomId: string): Promise<{
  winner: string,
  matches: MatchResult[]
}> {
  // 1. Supabase'den oyuncuları ve kadroları çek
  // 2. Kapasite'ye göre bracket oluştur (4/8/16 → SF/QF/R16)
  // 3. Her maç için simulateMatch() çağır
  // 4. Kazananları bracket boyunca ilerlet
  // 5. matches tablosuna yaz
  // 6. rooms.status = 'simulating', winner_wallet = champion set et
  // 7. champion wallet'ı döndür
}
```

### 7.3 Turnuva Formatı

| Kapasite | Round | Maç Sayısı |
|---|---|---|
| 4 | SF + Final | 3 |
| 8 | QF + SF + Final | 7 |
| 16 | R16 + QF + SF + Final | 15 |

Bracket seed: Supabase'e kayıt sırasına göre (joined_at asc). İlk yarı bracket left side, ikinci yarı right side.

---

## 8. Smart Contract — TournamentPool.sol

Mevcut `contracts/` dizinine yazılacak. Tasarım kararları:
- Tek kontrat, her oda için ayrı entry + bet pool mapping
- Kazanan off-chain belirlenir, owner iki fonksiyon çağırır
- `distributeBetWinners` batch payout — backend hesaplar, kontrat dağıtır
- Reentrancy yok (state sıfırlanıyor transfer öncesi, `call{value}` kullanılıyor)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TournamentPool {

    enum RoomStatus { Open, Closed, Finished }

    struct Room {
        bytes32 id;
        uint256 entryFee;
        uint256 entryPool;
        uint256 betPool;
        RoomStatus status;
        address winner;
        address[] players;
    }

    address public immutable owner;

    mapping(bytes32 => Room) private rooms;
    mapping(bytes32 => mapping(address => bool)) public hasEntered;
    mapping(bytes32 => mapping(address => uint256)) public betAmounts;

    event RoomCreated(bytes32 indexed roomId, uint256 entryFee);
    event EntryPaid(bytes32 indexed roomId, address indexed player, uint256 amount);
    event BetPlaced(bytes32 indexed roomId, address indexed bettor, address indexed target, uint256 amount);
    event RoomClosed(bytes32 indexed roomId, uint256 entryPool, uint256 betPool);
    event WinnerPaid(bytes32 indexed roomId, address indexed winner, uint256 amount);
    event BetWinnerPaid(bytes32 indexed roomId, address indexed bettor, uint256 amount);

    error NotOwner();
    error RoomNotOpen();
    error RoomNotClosed();
    error AlreadyEntered();
    error WrongFee(uint256 sent, uint256 required);
    error RoomAlreadyExists();
    error TransferFailed();
    error InvalidWinner();
    error InvalidTarget();
    error ArrayLengthMismatch();
    error NoBetPool();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createRoom(bytes32 roomId, uint256 entryFee) external onlyOwner {
        if (rooms[roomId].entryFee != 0) revert RoomAlreadyExists();
        rooms[roomId].id = roomId;
        rooms[roomId].entryFee = entryFee;
        rooms[roomId].status = RoomStatus.Open;
        emit RoomCreated(roomId, entryFee);
    }

    function closeRoom(bytes32 roomId) external onlyOwner {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Open) revert RoomNotOpen();
        room.status = RoomStatus.Closed;
        emit RoomClosed(roomId, room.entryPool, room.betPool);
    }

    function declareWinner(bytes32 roomId, address winnerAddress) external onlyOwner {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Closed) revert RoomNotClosed();
        if (!hasEntered[roomId][winnerAddress]) revert InvalidWinner();
        room.winner = winnerAddress;
        room.status = RoomStatus.Finished;
        uint256 payout = room.entryPool;
        room.entryPool = 0;
        (bool ok,) = winnerAddress.call{value: payout}("");
        if (!ok) revert TransferFailed();
        emit WinnerPaid(roomId, winnerAddress, payout);
    }

    function distributeBetWinners(
        bytes32 roomId,
        address[] calldata winners,
        uint256[] calldata amounts
    ) external onlyOwner {
        if (winners.length != amounts.length) revert ArrayLengthMismatch();
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Finished) revert RoomNotClosed();
        if (room.betPool == 0) revert NoBetPool();
        uint256 remaining = room.betPool;
        room.betPool = 0;
        for (uint256 i = 0; i < winners.length; i++) {
            require(amounts[i] <= remaining, "Payout exceeds pool");
            remaining -= amounts[i];
            (bool ok,) = winners[i].call{value: amounts[i]}("");
            if (!ok) revert TransferFailed();
            emit BetWinnerPaid(roomId, winners[i], amounts[i]);
        }
        if (remaining > 0) {
            (bool ok,) = owner.call{value: remaining}("");
            if (!ok) revert TransferFailed();
        }
    }

    function enter(bytes32 roomId) external payable {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Open) revert RoomNotOpen();
        if (hasEntered[roomId][msg.sender]) revert AlreadyEntered();
        if (msg.value != room.entryFee) revert WrongFee(msg.value, room.entryFee);
        hasEntered[roomId][msg.sender] = true;
        room.players.push(msg.sender);
        room.entryPool += msg.value;
        emit EntryPaid(roomId, msg.sender, msg.value);
    }

    function placeBet(bytes32 roomId, address target) external payable {
        Room storage room = rooms[roomId];
        if (room.status != RoomStatus.Open) revert RoomNotOpen();
        if (!hasEntered[roomId][target]) revert InvalidTarget();
        if (betAmounts[roomId][msg.sender] > 0) revert AlreadyEntered();
        if (msg.value == 0) revert WrongFee(0, 1);
        betAmounts[roomId][msg.sender] = msg.value;
        room.betPool += msg.value;
        emit BetPlaced(roomId, msg.sender, target, msg.value);
    }

    function getRoom(bytes32 roomId) external view returns (
        uint256 entryFee,
        uint256 entryPool,
        uint256 betPool,
        RoomStatus status,
        address winner,
        address[] memory players
    ) {
        Room storage room = rooms[roomId];
        return (room.entryFee, room.entryPool, room.betPool, room.status, room.winner, room.players);
    }

    function getPlayers(bytes32 roomId) external view returns (address[] memory) {
        return rooms[roomId].players;
    }
}
```

**Güvenlik notları:**
- `distributeBetWinners`: `remaining` ile overflow engellenir.
- `placeBet`: `betAmounts > 0` → double-bet engellenir.
- `declareWinner`: sadece `Closed` odada çalışır; ikinci çağrı `entryPool = 0` olduğu için anlamsız.
- Sıralama kritik: `declareWinner` → `distributeBetWinners`.

---

## 9. Supabase DB Schema

```sql
-- ROOMS
create table rooms (
  id               text primary key,        -- nanoid(10)
  name             text not null,
  status           text default 'open',     -- open | drafting | betting | simulating | finished
  capacity         int not null,            -- 4, 8, veya 16
  entry_fee_wei    text not null,           -- wei string
  contract_room_id text not null,           -- bytes32 hex (0x...)
  draft_started_at timestamptz,             -- draft başlangıç zamanı (timer için)
  betting_started_at timestamptz,           -- betting window başlangıcı
  winner_wallet    text,
  created_at       timestamptz default now()
);

-- PLAYERS (entry fee ödeyenler)
create table players (
  id           uuid primary key default gen_random_uuid(),
  room_id      text references rooms(id) on delete cascade,
  wallet       text not null,
  tx_hash      text not null unique,
  squad_json   jsonb,                       -- [{name, position, pace, shooting, passing, tackling}]
  draft_done   boolean default false,
  joined_at    timestamptz default now(),
  unique(room_id, wallet)
);

-- MATCHES (sim engine çıktısı)
create table matches (
  id           uuid primary key default gen_random_uuid(),
  room_id      text references rooms(id) on delete cascade,
  round        text not null,              -- 'R16' | 'QF' | 'SF' | 'Final'
  match_index  int not null,              -- round içindeki sıra (0-based)
  home_wallet  text not null,
  away_wallet  text not null,
  home_score   int not null,
  away_score   int not null,
  winner_wallet text not null,
  sim_data     jsonb,                     -- MatchSimulation (events + ticks) — replay için
  played_at    timestamptz default now()
);

-- BETS
create table bets (
  id             uuid primary key default gen_random_uuid(),
  room_id        text references rooms(id) on delete cascade,
  bettor_wallet  text not null,
  target_wallet  text not null,
  amount_wei     text not null,
  tx_hash        text not null unique,
  payout_wei     text,
  won            boolean,
  placed_at      timestamptz default now(),
  unique(room_id, bettor_wallet)
);

-- LEADERBOARD
create table leaderboard (
  wallet             text primary key,
  wins               int default 0,
  losses             int default 0,
  draws              int default 0,
  goals_for          int default 0,
  goals_against      int default 0,
  tournaments_played int default 0,
  total_earned_wei   text default '0',
  updated_at         timestamptz default now()
);
```

**RLS:**
- `rooms`, `players`, `matches`, `bets`: okuma herkese açık (anon key)
- INSERT/UPDATE: sadece `service_role` key ile (API routes'tan)

---

## 10. TypeScript Types (`lib/contracts/types.ts` → sıfırlanacak)

```typescript
import type { Address } from 'viem'

export type RoomStatus = 'open' | 'drafting' | 'betting' | 'simulating' | 'finished'
export type MatchRound = 'R16' | 'QF' | 'SF' | 'Final'

export interface Room {
  id: string
  name: string
  status: RoomStatus
  capacity: number                     // 4 | 8 | 16
  entry_fee_wei: string
  contract_room_id: `0x${string}`
  draft_started_at: string | null
  betting_started_at: string | null
  winner_wallet: Address | null
  created_at: string
}

export interface Player {
  id: string
  room_id: string
  wallet: Address
  tx_hash: `0x${string}`
  squad_json: FootballPlayer[] | null
  draft_done: boolean
  joined_at: string
}

export interface FootballPlayer {
  name: string
  position: string  // ST | LW | RW | CM | CDM | CAM | CB | LB | RB | GK
  pace: number
  shooting: number
  passing: number
  tackling: number
}

export interface Match {
  id: string
  room_id: string
  round: MatchRound
  match_index: number
  home_wallet: Address
  away_wallet: Address
  home_score: number
  away_score: number
  winner_wallet: Address
  sim_data: import('@/lib/simulation/types').MatchSimulation | null
  played_at: string
}

export interface Bet {
  id: string
  room_id: string
  bettor_wallet: Address
  target_wallet: Address
  amount_wei: string
  tx_hash: `0x${string}`
  payout_wei: string | null
  won: boolean | null
  placed_at: string
}

export interface LeaderboardEntry {
  wallet: Address
  wins: number
  losses: number
  draws: number
  goals_for: number
  goals_against: number
  tournaments_played: number
  total_earned_wei: string
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: number; message: string } }
```

---

## 11. Kritik API Routes

### POST /api/rooms — Oda oluştur (admin)
```
Body: { adminSecret, name, capacity, entryFeeWei }
→ nanoid(10) → bytes32 pad → Supabase insert → createRoom tx
Response: { id, contractRoomId, qrUrl }
```

### GET /api/rooms/[roomId] — Oda detayı
```
Response: { room, players: Player[], matches: Match[], bets: Bet[] }
```

### POST /api/rooms/[roomId]/start-draft — Draft başlat (admin)
```
Body: { adminSecret }
→ rooms.status = 'drafting', draft_started_at = now()
→ Supabase update
```

### POST /api/join — Entry tx doğrula
```
Body: { roomId, contractRoomId, wallet, txHash }
→ viem getTransactionReceipt → EntryPaid event doğrula
→ Supabase players insert
→ Oda doldu mu? → status kontrol
```

### POST /api/draft — Kadro kaydet
```
Body: { roomId, wallet, squadJson }
→ players.squad_json = squadJson, draft_done = true
→ Tüm oyuncular draft_done mu? → rooms.status = 'betting', betting_started_at = now()
```

### POST /api/bet — Bet tx doğrula
```
Body: { roomId, contractRoomId, bettorWallet, targetWallet, amountWei, txHash }
→ BetPlaced event doğrula → Supabase bets insert
```

### POST /api/sim — Sim tetikle (admin)
```
Body: { roomId, adminSecret }
→ runTournamentSim(roomId)
  → tüm match sonuçları hesaplanır, sim_data (events+ticks) Supabase'e yazılır
  → rooms.status = 'simulating', winner_wallet set
Response: { winner, matchCount }
```

### POST /api/payout — Ödülleri dağıt (admin, sim bittikten sonra)
```
Body: { roomId, adminSecret }
→ calculateBetPayouts(roomId, winnerWallet)
→ closeRoom(contractRoomId) tx (entry kapatılmışsa gerekli)
→ declareWinner(contractRoomId, winnerWallet) tx
→ distributeBetWinners(contractRoomId, winners[], amounts[]) tx
→ rooms.status = 'finished'
Response: { winnerTx, betTx }
```

---

## 12. Web3 Konfigürasyonu

`frontend/src/lib/wagmi.ts` — **değiştirilmez**, mevcut Monad Testnet tanımı korunur:
```typescript
export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'MonadScan', url: 'https://testnet.monadexplorer.com' } },
  testnet: true,
})
```

### roomId → bytes32
`lib/utils/format.ts`'e ekle (veya mevcut `viem` utility'lerle):
```typescript
import { stringToBytes, padBytes, bytesToHex } from 'viem'
export function toBytes32(str: string): `0x${string}` {
  return bytesToHex(padBytes(stringToBytes(str), { size: 32 }))
}
```

### Hooks

**`hooks/useEnterRoom.ts`**
```typescript
export function useEnterRoom() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const enter = (contractRoomId: `0x${string}`, entryFee: bigint) =>
    writeContract({ abi: TOURNAMENT_POOL_ABI, address: CONTRACT_ADDRESS,
      functionName: 'enter', args: [contractRoomId], value: entryFee })
  return { enter, hash, isPending, isConfirming, isSuccess, error }
}
```

**`hooks/usePlaceBet.ts`**
```typescript
export function usePlaceBet() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
  const placeBet = (contractRoomId: `0x${string}`, target: `0x${string}`, amount: bigint) =>
    writeContract({ abi: TOURNAMENT_POOL_ABI, address: CONTRACT_ADDRESS,
      functionName: 'placeBet', args: [contractRoomId, target], value: amount })
  return { placeBet, hash, isPending, isConfirming, isSuccess, error }
}
```

---

## 13. Environment Variables

```bash
# frontend/.env.local

# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ENTRY_FEE_WEI=10000000000000000       # 0.01 MON default

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # okuma, client-side OK
SUPABASE_SERVICE_ROLE_KEY=eyJ...                  # yazma, ASLA NEXT_PUBLIC_ yapma

# Admin / server-side
ADMIN_SECRET=                                      # /api/sim + /api/rooms POST koruması
OWNER_PRIVATE_KEY=0x...                           # declareWinner + distributeBetWinners imzası
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
```

```bash
# contracts/.env
PRIVATE_KEY=0x...
MONAD_TESTNET_RPC_URL=https://testnet-rpc.monad.xyz
```

---

## 14. Mevcut Dosya Durumu Özeti

| Dosya / Klasör | Aksiyon | Not |
|---|---|---|
| `lib/simulation/engine.ts` | KULLAN | simulateMatch() korunur, SimInput adaptasyonu |
| `lib/simulation/types.ts` | KULLAN | MatchEvent, MatchTick, Pos tipleri sağlam |
| `lib/simulation/seeder.ts` | KULLAN | SeededRNG dokunma |
| `lib/simulation/tactics.ts` | KULLAN | getTactic → autoStrategy için |
| `lib/simulation/positions.ts` | KULLAN | buildFormationPositions dokunma |
| `lib/constants/squad.ts` | KULLAN | POS_GROUP, GROUP_LABEL mapping'leri |
| `lib/constants/theme.ts` | KULLAN | |
| `lib/utils/format.ts` | KULLAN + toBytes32 ekle | |
| `lib/utils/retry.ts` | KULLAN | |
| `lib/contracts/abi.ts` | GÜNCELLE | TournamentPool ABI |
| `lib/contracts/types.ts` | SIFIRLA | Yeni Room/Player/Bet/Match tipleri |
| `lib/contracts/queries.ts` | SIFIRLA | On-chain agent query'leri kalkıyor |
| `lib/contracts/strategies.ts` | SİL | |
| `lib/contracts/client.ts` | GÜNCELLE | TournamentPool client |
| `components/tournaments/MatchBracket.tsx` | KULLAN | |
| `components/tournaments/MatchReplay.tsx` | KULLAN | |
| `components/tournaments/AnimatedPitch.tsx` | KULLAN | |
| `components/tournaments/EventTicker.tsx` | KULLAN | |
| `components/tournaments/ReplayControls.tsx` | KULLAN | |
| `components/tournaments/FootballPitch.tsx` | KULLAN | |
| `components/tournaments/TournamentSpectator.tsx` | ADAPT | Kadro grid gösterimi |
| `components/agents/AgentCard.tsx` | SİL | |
| `components/agents/ManagersGrid.tsx` | SİL | |
| `components/agents/SquadTable.tsx` | OPSİYONEL | SquadSummary olarak adapt |
| `components/live/LiveLobbyGrid.tsx` | REFERANS | SquadRevealGrid için |
| `components/live/LiveTournamentCard.tsx` | ADAPT | RoomCard olarak |
| `components/live/ParticipantCard.tsx` | REFERANS | PlayerCard için |
| `components/bazaar/PlayerBazaar.tsx` | REFERANS | Draft kart grid için |
| `components/ui/*` | KULLAN | Tüm primitifler korunur |
| `components/layout/*` | KULLAN | Nav, PageHeader korunur |
| `components/home/*` | KULLAN | Landing page dokunulmaz |
| `hooks/useLiveTournament.ts` | ADAPT | Supabase realtime'a çevir |
| `app/tournaments/`, `app/live/`, `app/draft/`, `app/managers/` | DEĞERLENDİR | Yeni route yapısına geç |

---

## 15. Phase Roadmap (48h)

| Phase | Focus | Dosyalar | Süre |
|---|---|---|---|
| **1 — Setup** | Temizlik + scaffold | Stale dosyaları sil/güncelle, Supabase proje + tablolar, .env | 1.5h |
| **2 — Contract** | TournamentPool.sol | `contracts/src/TournamentPool.sol`, test, Monad deploy, ABI kopyala | 2h |
| **3 — API Core** | Temel routes | `/api/rooms`, `/api/join`, `/api/draft` + Supabase client | 3h |
| **4 — Join + Lobby** | Entry akışı | `/join/[roomId]`, `/lobby/[roomId]`, `useEnterRoom.ts`, `QRDisplay.tsx` | 3h |
| **5 — Draft UI** | Ana oyun | `/draft/[roomId]`, `DraftPhase.tsx`, `PlayerCard.tsx`, `DraftTimer.tsx`, `draft-pool.ts` | 5h |
| **6 — Watch ekranı** | İzleme hub | `/watch/[roomId]`, `SquadRevealGrid.tsx`, `BettingCountdown.tsx`, `BetForm.tsx` | 4h |
| **7 — Sim + Bracket** | Sim engine | `lib/sim-engine.ts`, `/api/sim`, bracket replay akışı (mevcut components) | 4h |
| **8 — Payout** | Ödül dağıtım | `lib/payout.ts`, `/api/payout`, `PayoutSummary.tsx`, `usePlaceBet.ts` | 3h |
| **9 — Admin** | Yönetim paneli | `/admin/page.tsx` — oda oluştur, QR, draft başlat, sim tetikle, ödül dağıt | 3h |
| **10 — Polish** | Demo hazırlık | Loading states, mobile QR test, SWR polling tune, seed data | 4h |

**Kritik path:** Phase 2 (contract) → Phase 3 (API) → Phase 5 (Draft) → Phase 7 (Sim).
Phase 4, 6, 8, 9 Phase 3 ile paralel ilerleyebilir.

---

## 16. Work Packages (WP)

Proje 4 WP'ye bölünmüştür. WP0 her şeyden önce tamamlanır (~1h), ardından WP1 + WP2 + WP3 paralel ilerler.

```
WP0 ──────────────────────────────────► (herkes başlar)
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                        WP1 (BC)         WP2 (Backend)      WP3 (Frontend)
                          │                   │                   │
                          └──── ABI + addr ───►                   │
                                              └──── API shapes ───►
```

---

### WP0 — Shared Foundation ✅ TAMAMLANDI
**Sahip:** İkisi birlikte (30-60 dk, en başta)
**Amaç:** WP1/2/3'ün birbirine bağlı olduğu contract'ları önceden kilitler. Kimse birbirini beklemeden mock'suz çalışmaya başlar.

#### Deliverable'lar

**`frontend/src/lib/contracts/types.ts`** — tüm TypeScript tipleri:
```typescript
import type { Address } from 'viem'

export type RoomStatus = 'open' | 'drafting' | 'betting' | 'simulating' | 'finished'
export type MatchRound = 'R16' | 'QF' | 'SF' | 'Final'
export type PositionGroup = 'ATT' | 'MID' | 'DEF' | 'GK'

export interface FootballPlayer {
  name: string
  position: string  // ST | LW | RW | CM | CDM | CAM | CB | LB | RB | GK
  pace: number      // 0–100
  shooting: number
  passing: number
  tackling: number
}

export interface Room {
  id: string
  name: string
  status: RoomStatus
  capacity: number                      // 4 | 8 | 16
  entry_fee_wei: string
  contract_room_id: `0x${string}`
  draft_started_at: string | null
  betting_started_at: string | null
  winner_wallet: Address | null
  created_at: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  wallet: Address
  tx_hash: `0x${string}`
  squad_json: FootballPlayer[] | null
  draft_done: boolean
  joined_at: string
}

export interface Match {
  id: string
  room_id: string
  round: MatchRound
  match_index: number
  home_wallet: Address
  away_wallet: Address
  home_score: number
  away_score: number
  winner_wallet: Address
  sim_data: import('@/lib/simulation/types').MatchSimulation | null
  played_at: string
}

export interface Bet {
  id: string
  room_id: string
  bettor_wallet: Address
  target_wallet: Address
  amount_wei: string
  tx_hash: `0x${string}`
  payout_wei: string | null
  won: boolean | null
  placed_at: string
}

export interface LeaderboardEntry {
  wallet: Address
  wins: number
  losses: number
  draws: number
  goals_for: number
  goals_against: number
  tournaments_played: number
  total_earned_wei: string
}

// API response wrapper — tüm /api/* route'ları bu formatı kullanır
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: number; message: string } }

// GET /api/rooms/[roomId] response shape
export interface RoomDetail {
  room: Room
  players: RoomPlayer[]
  matches: Match[]
  bets: Bet[]
}
```

**`frontend/src/lib/constants/players.ts`** — oyuncu veritabanı:
```typescript
import type { FootballPlayer } from '@/lib/contracts/types'

// 88 oyuncu, 8 tier'a bölünmüş
// Her mevki grubu için yeterli sayı:
//   GK: min 10, ATT (ST/LW/RW): min 30, MID (CM/CDM/CAM): min 25, DEF (CB/LB/RB): min 23
export const FOOTBALL_PLAYERS: FootballPlayer[] = [
  // GK
  { name: "Buffon",      position: "GK",  pace: 40, shooting: 15, passing: 55, tackling: 20 },
  { name: "Casillas",    position: "GK",  pace: 42, shooting: 13, passing: 58, tackling: 22 },
  { name: "Yashin",      position: "GK",  pace: 38, shooting: 10, passing: 50, tackling: 18 },
  // ... (tüm 88 oyuncu buraya — tier'a göre rating range'leri: Tier1: 85-99, Tier8: 55-64)
]
```

**`frontend/src/lib/contracts/abi.ts`** — TournamentPool ABI (WP1 deploy ettikten sonra güncellenir, başlangıçta stub):
```typescript
export const TOURNAMENT_POOL_ABI = [
  // createRoom, closeRoom, declareWinner, distributeBetWinners
  // enter, placeBet
  // getRoom, getPlayers
  // Events: RoomCreated, EntryPaid, BetPlaced, RoomClosed, WinnerPaid, BetWinnerPaid
] as const
```

**`frontend/src/constants/index.ts`**:
```typescript
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`
export const DRAFT_DURATION_MS = 60_000   // 60s
export const BETTING_DURATION_MS = 60_000 // 60s
export const ROOM_CAPACITIES = [4, 8, 16] as const
```

#### WP0 Bağımlılıkları
Hiçbir WP'ye bağlı değil — sıfırdan yazılır.

#### WP0'ın Diğer WP'lere Verdiği Şeyler
- WP2 ve WP3: tip güvenliği, API response shape'leri
- WP3: `DRAFT_DURATION_MS`, `BETTING_DURATION_MS` sabitleri
- WP1: ABI stub (WP1 deploy sonrası günceller)

---

### WP1 — Smart Contract (Blockchain)
**Sahip:** 1 kişi
**Tahmini süre:** 3–4h
**Bağımlılık:** WP0 (ABI stub)

#### Scope

Tek dosya grubu: `contracts/` dizini.

```
contracts/
├── src/
│   └── TournamentPool.sol         ← ANA TESLİMAT
├── test/
│   └── TournamentPool.t.sol       ← tüm testler geçmeli
├── script/
│   └── DeployTournamentPool.s.sol ← Monad testnet deploy
└── foundry.toml
```

#### Deliverable'lar

1. **`TournamentPool.sol`** — Section 8'deki tam kod implement edilir.

2. **Test coverage** (`TournamentPool.t.sol`) — şu senaryolar zorunlu:
   - `createRoom` → duplicate revert
   - `enter` → wrong fee revert, double entry revert, entryPool birikimi
   - `placeBet` → invalid target revert, double bet revert, betPool birikimi
   - `closeRoom` → sadece Open odada çalışır
   - `declareWinner` → entry pool kazanana gider, invalid winner revert
   - `distributeBetWinners` → orantılı dağıtım, array mismatch revert

3. **Deploy** → Monad Testnet'e deploy, çıktı:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` değeri
   - `broadcast/` klasörü commit'lenir

4. **ABI güncellemesi** → deploy sonrası:
   - `forge build` çalıştır
   - `out/TournamentPool.sol/TournamentPool.json`'dan ABI array'i al
   - `frontend/src/lib/contracts/abi.ts`'deki stub'ı gerçek ABI ile değiştir

#### WP1'in Diğer WP'lere Verdiği Şeyler
- **WP2'ye:** Deploy edilmiş contract adresi + final ABI (tx verify için)
- **WP3'e:** Final ABI (wagmi hook'ları için)

#### WP1 Interface Contract (BC ↔ Backend)

WP2'nin ihtiyaç duyduğu event'ler:
```
EntryPaid(bytes32 indexed roomId, address indexed player, uint256 amount)
BetPlaced(bytes32 indexed roomId, address indexed bettor, address indexed target, uint256 amount)
```
WP2 bu event'leri `viem.decodeEventLog()` ile decode eder, tx verify için.

WP2'nin çağırdığı fonksiyonlar (server-side wallet client ile):
```
closeRoom(bytes32 roomId)
declareWinner(bytes32 roomId, address winnerAddress)
distributeBetWinners(bytes32 roomId, address[] winners, uint256[] amounts)
```

#### WP1 YAPMAZ
- Frontend kodu
- Supabase bağlantısı
- Sim engine
- Mevcut `agents/` veya eski kontrat koduna dokunmak

---

### WP2 — Backend
**Sahip:** 1 kişi
**Tahmini süre:** 14–16h
**Bağımlılık:** WP0 (tipler), WP1 (ABI + adres — tx verify için; stub'la başlanabilir)

#### Scope

`frontend/src/` altındaki tüm server-side kod:

```
frontend/src/
├── app/api/
│   ├── rooms/
│   │   ├── route.ts                    ← GET (liste) + POST (oda oluştur)
│   │   └── [roomId]/
│   │       ├── route.ts                ← GET (oda detayı)
│   │       └── start-draft/
│   │           └── route.ts            ← POST (draft başlat)
│   ├── join/
│   │   └── route.ts                    ← POST (entry tx verify + Supabase insert)
│   ├── draft/
│   │   └── route.ts                    ← POST (kadro kaydet + betting phase tetikle)
│   ├── bet/
│   │   ├── route.ts                    ← POST (bet tx verify + Supabase insert)
│   │   └── [roomId]/
│   │       └── route.ts                ← GET (odanın tüm betleri)
│   ├── sim/
│   │   └── route.ts                    ← POST (sim tetikle, admin only)
│   └── payout/
│       └── route.ts                    ← POST (contract call'ları tetikle)
│
└── lib/
    ├── supabase.ts                      ← createClient singleton (anon + service_role)
    ├── viem-client.ts                   ← publicClient (tx verify) + walletClient (tx gönder)
    ├── sim-engine.ts                    ← runTournamentSim(roomId) → {winner, matches}
    ├── payout.ts                        ← calculateBetPayouts(roomId, winner)
    └── draft-pool.ts                    ← getDraftPool(group, count) + getSlotConstraints()
                                            (server-side random fill için kullanılır)
```

Ayrıca **Supabase** kurulumu:
```
Supabase dashboard → SQL Editor → Section 9'daki schema çalıştır
RLS politikaları ekle
```

#### Deliverable'lar — Route Spec

Her route'un input/output contract'ı:

**`GET /api/rooms`**
```typescript
// Response: ApiResponse<Room[]>
// rooms tablosundan status='open' | 'drafting' | 'betting' olanları döndür
// Her room'a players sayısını join et
```

**`POST /api/rooms`**
```typescript
// Body: { adminSecret: string, name: string, capacity: 4|8|16, entryFeeWei: string }
// → adminSecret kontrolü
// → nanoid(10) → toBytes32() → contract_room_id
// → Supabase rooms insert
// → walletClient.writeContract('createRoom', [contractRoomId, entryFeeWei])
// Response: ApiResponse<{ room: Room, qrUrl: string }>
```

**`GET /api/rooms/[roomId]`**
```typescript
// Response: ApiResponse<RoomDetail>
// room + players + matches (sim_data dahil) + bets
```

**`POST /api/rooms/[roomId]/start-draft`**
```typescript
// Body: { adminSecret: string }
// → rooms.status = 'drafting', draft_started_at = NOW()
// Response: ApiResponse<{ started: true }>
```

**`POST /api/join`**
```typescript
// Body: { roomId, contractRoomId, wallet, txHash }
// → viem getTransactionReceipt({ hash: txHash })
// → EntryPaid event decode et, roomId + wallet eşleşiyor mu kontrol et
// → players insert ({ room_id, wallet, tx_hash })
// → players sayısı == capacity? → rooms.status = 'full' değil, admin draft başlatır
// Response: ApiResponse<{ joined: true }>
```

**`POST /api/draft`**
```typescript
// Body: { roomId, wallet, squadJson: FootballPlayer[] }
// → squadJson validasyonu: 11 oyuncu, pozisyon sayıları (min/max kuralları)
// → players update: squad_json = squadJson, draft_done = true
// → Tüm oyuncular draft_done=true? → rooms.status = 'betting', betting_started_at = NOW()
// Response: ApiResponse<{ saved: true, bettingStarted: boolean }>
```

**`POST /api/bet`**
```typescript
// Body: { roomId, contractRoomId, bettorWallet, targetWallet, amountWei, txHash }
// → BetPlaced event decode + verify
// → bets insert
// Response: ApiResponse<{ betPlaced: true }>
```

**`GET /api/bet/[roomId]`**
```typescript
// Response: ApiResponse<Bet[]>
// Odanın tüm bet'leri (herkese açık)
```

**`POST /api/sim`**
```typescript
// Body: { roomId: string, adminSecret: string }
// → runTournamentSim(roomId) çağır
// → rooms.status = 'simulating' yaz
// Response: ApiResponse<{ winner: string, matchCount: number }>
```

**`POST /api/payout`**
```typescript
// Body: { roomId: string, adminSecret: string }
// → calculateBetPayouts(roomId, winnerWallet)
// → walletClient: closeRoom(contractRoomId)
// → walletClient: declareWinner(contractRoomId, winnerWallet)
// → betPayouts.length > 0? → walletClient: distributeBetWinners(...)
// → rooms.status = 'finished'
// → Supabase leaderboard upsert
// Response: ApiResponse<{ winnerTx, betTx }>
```

#### Sim Engine Detayı (`lib/sim-engine.ts`)

```typescript
// Mevcut frontend/src/lib/simulation/engine.ts'i import eder
// SimInput için adapter: FootballPlayer[] + autoStrategy() → SimInput
// Bracket builder: capacity'ye göre (4→SF, 8→QF, 16→R16) oluşturur
// Her maç: simulateMatch(input) → MatchSimulation
// Tüm sonuçlar matches tablosuna yazar (sim_data = full MatchSimulation JSON)
// rounds: 'R16' | 'QF' | 'SF' | 'Final', match_index: 0-based

function autoStrategy(squad: FootballPlayer[]): number {
  // ATT ağırlıklı kadro → Counter (3)
  // DEF ağırlıklı kadro → Park the Bus (4)
  // MID ağırlıklı kadro → Possession (2)
  // default → High Press (1)
}
```

#### Draft Pool (`lib/draft-pool.ts`)

```typescript
// Oyuncu havuzundan random seçim — bağımsız, her çağrıda farklı
export function getDraftPool(group: PositionGroup, count: number): FootballPlayer[]
// FOOTBALL_PLAYERS'dan group'a göre filtrele, shuffle, slice(0, count)

// Timer sıfırlandığında random kadro tamamlama
export function randomFillSquad(partial: Partial<Record<PositionGroup, FootballPlayer[]>>): FootballPlayer[]
// Eksik slotları getDraftPool ile doldurur, toplam 11 oyuncu döner

// Draft constraint hesaplama (frontend'e de API üzerinden verilmez, sadece /api/draft validasyonunda kullanılır)
export function getSlotConstraints(picked: Record<PositionGroup, number>): Record<PositionGroup, { min: number, max: number }>
```

#### WP2'nin Diğer WP'lere Verdiği Şeyler
- **WP3'e:** Tüm API endpoint'leri (URL + request/response shape)
- **WP3'e:** `draft_started_at` ve `betting_started_at` timestamp'leri (client-side timer senkronizasyonu için)

#### WP2 YAPMAZ
- React component
- wagmi hook
- Sayfa routing
- `lib/simulation/` içindeki mevcut dosyalara dokunmak (sadece import eder)

---

### WP3 — Frontend
**Sahip:** 1 kişi
**Tahmini süre:** 16–18h
**Bağımlılık:** WP0 (tipler + sabitler), WP1 (ABI), WP2 (API shapes — başlangıçta mock data ile çalışılabilir)

#### Scope

Tüm client-side kod:

```
frontend/src/
├── app/
│   ├── admin/page.tsx
│   ├── rooms/page.tsx
│   ├── join/[roomId]/page.tsx
│   ├── lobby/[roomId]/page.tsx
│   ├── draft/[roomId]/page.tsx
│   └── watch/[roomId]/page.tsx
│
├── components/
│   ├── draft/
│   │   ├── DraftPhase.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── DraftTimer.tsx
│   │   ├── PositionProgress.tsx
│   │   └── SquadSummary.tsx
│   ├── room/
│   │   ├── QRDisplay.tsx
│   │   ├── QRScanner.tsx
│   │   ├── PlayerList.tsx
│   │   └── RoomStatusBadge.tsx
│   └── watch/
│       ├── SquadRevealGrid.tsx
│       ├── BetForm.tsx
│       ├── BettingCountdown.tsx
│       └── PayoutSummary.tsx
│
└── hooks/
    ├── useEnterRoom.ts
    ├── usePlaceBet.ts
    ├── useRoom.ts
    └── useDraft.ts
```

#### Deliverable'lar — Sayfa Spec

**`/admin`** — Admin paneli
- Yeni oda formu: isim input, kapasite dropdown (4/8/16), entry fee input
- "Oda Oluştur" → POST /api/rooms → QR görüntülenir (QRDisplay)
- Açık odalar listesi (SWR polling, 3s)
- Her oda için: oyuncu sayısı / kapasite, "Draft Başlat" butonu (capacity dolunca aktif)
- "Draft Başlat" → POST /api/rooms/[roomId]/start-draft
- Draft aşamasında: kadro oluşum ekranı (SquadRevealGrid — partial kadrolar)
- Betting window sayacı (BettingCountdown)
- "Sim Başlat" butonu (betting window bitince aktif) → POST /api/sim
- Maçlar replay olarak oynatılır (MatchReplay + MatchBracket)
- "Ödülleri Dağıt" butonu (tüm replay bittikten sonra) → POST /api/payout

**`/rooms`** — Oda listesi (bahisçiler için)
- SWR → GET /api/rooms
- Her oda: isim, kapasite doluluk, entry fee, status badge, bettor sayısı
- "İzle" linki → /watch/[roomId]

**`/join/[roomId]`** — QR hedef sayfası
- Oda bilgisi göster (kapasite, fee, mevcut oyuncu sayısı)
- "Cüzdan Bağla" (RainbowKit)
- "Katıl — X MON öde" → useEnterRoom() → enter(contractRoomId, entryFee)
- tx onaylanınca → POST /api/join → /lobby/[roomId]'e yönlendir
- Oda doluysa → "İzleyici olarak gir" → /watch/[roomId]

**`/lobby/[roomId]`** — Bekleme ekranı (oyuncular için)
- SWR 3s → GET /api/rooms/[roomId]
- Gelen oyuncular listesi (PlayerList — cüzdan adresleri, joined_at)
- "X/Y oyuncu hazır" göstergesi
- room.status === 'drafting' → otomatik /draft/[roomId]'e yönlendir

**`/draft/[roomId]`** — Draft UI (ANA EKRAN)

```
┌──────────────────────────────────────────────────────┐
│  MonaDraft        ⏱ 00:47          ATT > MID > DEF > GK │
├─────────────────────────────────┬────────────────────┤
│  FORVETLER (1–4 seç)            │   KADRON           │
│                                 │                    │
│  ┌──────┐ ┌──────┐ ┌──────┐    │  ATT: Ronaldo,... │
│  │Messi │ │CR7   │ │Haaland│   │  MID: —           │
│  │ ST   │ │ ST   │ │ ST   │    │  DEF: —           │
│  │pace92│ │...   │ │...   │    │  GK:  —           │
│  └──────┘ └──────┘ └──────┘    │                    │
│  ... 10 kart grid ...          │  11/11 ●●●●●●●●○○  │
│                                 │                    │
│  [Seçimi Onayla (2/4)]         │                    │
└─────────────────────────────────┴────────────────────┘
```

State (Zustand):
```typescript
interface DraftStore {
  phase: PositionGroup          // 'ATT' | 'MID' | 'DEF' | 'GK'
  picks: Record<PositionGroup, FootballPlayer[]>
  pool: Record<PositionGroup, FootballPlayer[]>  // 10 kart, sayfa açılınca üretilir
  timer: number                 // draft_started_at'tan hesaplanır
  constraints: Record<PositionGroup, { min: number, max: number }>
}
```

Timer sıfırlanınca: `randomFillSquad(picks)` → POST /api/draft → /watch/[roomId]

**`/watch/[roomId]`** — İzleme hub'ı (herkes için, state'e göre değişir)

| room.status | Gösterim |
|---|---|
| `open` | "X/Y oyuncu bekleniyor", katıl linki |
| `drafting` | Canlı kadro oluşumu (SquadRevealGrid, SWR 3s), kadrolar oluşunca küçük saha kartları gözükür |
| `betting` | Tüm kadrolar (SquadRevealGrid), BetForm + BettingCountdown (60s) |
| `simulating` | MatchBracket + MatchReplay sırayla (bir maç biter, Supabase'den sonraki alınır) |
| `finished` | Kazanan banner, sıralama tablosu, PayoutSummary |

#### Deliverable'lar — Component Spec

**`DraftPhase.tsx`**
```typescript
interface Props {
  group: PositionGroup
  pool: FootballPlayer[]        // 10 kart (GK için 3)
  selected: FootballPlayer[]
  constraints: { min: number, max: number }
  onToggle: (player: FootballPlayer) => void
  onConfirm: () => void
}
// Grid layout: 5x2 (veya 3x1 GK için)
// Seçili kart: yeşil border, checkmark
// Min karşılanmadıysa "Onayla" disabled
```

**`PlayerCard.tsx`**
```typescript
interface Props {
  player: FootballPlayer
  selected: boolean
  onClick: () => void
}
// Pixel art tarzı kart (mevcut tema ile uyumlu)
// Mevki rengi: POS_COLOR[player.position] (lib/constants/squad.ts'den)
// 4 stat: pace, shooting, passing, tackling → statDots() ile göster
```

**`DraftTimer.tsx`**
```typescript
interface Props {
  startedAt: string             // ISO timestamp (Supabase'den)
  durationMs: number            // DRAFT_DURATION_MS (60_000)
  onExpire: () => void
}
// useEffect ile interval — her saniye güncelle
// Renk: yeşil > 30s, turuncu > 10s, kırmızı ≤ 10s
// onExpire: parent'ta randomFill tetiklenir
```

**`SquadRevealGrid.tsx`**
```typescript
interface Props {
  players: RoomPlayer[]         // tüm oda oyuncuları
  showSquads: boolean           // false = draft aşaması (sadece draft_done=true gösterilir)
}
// Her oyuncu için küçük saha kartı (TournamentSpectator'dan adapte)
// draft_done=true → saha dizilimi göster (AnimatedPitch / FootballPitch'i kullan)
// draft_done=false → "Kuruyor..." spinner
```

**`BetForm.tsx`**
```typescript
interface Props {
  players: RoomPlayer[]
  roomId: string
  contractRoomId: `0x${string}`
}
// Oyuncu seç (radio cards)
// MON miktarı input (min 0.001)
// "Bet At" → usePlaceBet() → tx onay → POST /api/bet
```

**`QRDisplay.tsx`**
```typescript
interface Props { url: string; roomName: string; playerCount: number; capacity: number; bettorCount: number }
// qrcode.react QRCode komponenti
// Altında: "{playerCount}/{capacity} oyuncu · {bettorCount} bettor"
```

#### Hooks Spec

**`useRoom(roomId: string)`**
```typescript
// SWR → GET /api/rooms/[roomId], 3s refresh
// Returns: { room, players, matches, bets, isLoading, error }
```

**`useEnterRoom()`**
```typescript
// wagmi useWriteContract → enter(contractRoomId)
// Returns: { enter, hash, isPending, isConfirming, isSuccess, error }
```

**`usePlaceBet()`**
```typescript
// wagmi useWriteContract → placeBet(contractRoomId, targetWallet)
// Returns: { placeBet, hash, isPending, isConfirming, isSuccess, error }
```

**`useDraft(roomId: string)`**
```typescript
// Zustand DraftStore + timer logic
// submitDraft(squadJson) → POST /api/draft → router.push('/watch/[roomId]')
```

#### Mevcut Componentlerin Kullanım Şekli

| Mevcut Component | Nerede Kullanılır | Nasıl |
|---|---|---|
| `MatchBracket.tsx` | `/watch/[roomId]` simulating aşaması | prop olarak matches[] ver, aktif maçı highlight et |
| `MatchReplay.tsx` | `/watch/[roomId]` her maç için | sim_data.ticks ile besle |
| `AnimatedPitch.tsx` | `SquadRevealGrid` içinde | her oyuncunun kadrosunu formation'da göster |
| `EventTicker.tsx` | `/watch/[roomId]` replay sırasında | sim_data.events ile besle |
| `ReplayControls.tsx` | `/watch/[roomId]` | 1x / 2x / 4x hız |
| `FootballPitch.tsx` | `SquadRevealGrid` alt katman | dokunma |
| `TournamentSpectator.tsx` | `SquadRevealGrid` için referans | adapt et veya doğrudan kullan |

#### WP3 YAPMAZ
- API route'ları
- Supabase client
- Sim engine
- Contract kodu
- `lib/simulation/` içine dokunmak

---

### WP Bağımlılık Matrisi

| | WP0 | WP1 | WP2 | WP3 |
|---|---|---|---|---|
| **WP0** | — | — | — | — |
| **WP1** | WP0'dan ABI stub | — | — | — |
| **WP2** | WP0'dan tipler | WP1'den final ABI + adres | — | — |
| **WP3** | WP0'dan tipler + sabitler | WP1'den final ABI | WP2'den API shape'leri | — |

**Paralel çalışma:** WP1, WP2, WP3 aynı anda başlar.
- WP3, WP2 bitmeden başlayabilir → mock data (`const MOCK_ROOM: Room = {...}`) ile sayfalar yazılır.
- WP2, WP1 bitmeden başlayabilir → ABI stub ile, deploy sonrası adres env'e eklenir.

### Teslim Sırası ve Entegrasyon

```
T+0h:  WP0 tamamlandı → herkes başlar
T+4h:  WP1 tamamlandı → ABI + adres WP2 ve WP3'e verilir
T+10h: WP2 API routes hazır → WP3 mock'ları gerçek API'ye çevirir
T+16h: WP3 temel sayfalar + WP2 sim engine → entegrasyon testi
T+20h: WP1 deploy doğrulandı → WP3 wagmi hook'ları canlıya bağlanır
T+24h: E2E test: admin oda aç → oyuncu gir → draft → bet → sim → ödül
```
