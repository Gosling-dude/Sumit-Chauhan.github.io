// Run with: npm test   (Node 18+, no dependencies)
// Fixtures follow each platform's response format; the numbers are
// synthetic test values, not profile stats.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeProfile,
  countCodeforcesSolved,
  normalizeCodeforces,
  normalizeLeetCodeGraphQL,
  normalizeLeetCodeAlfa,
  parseCodeChefProfile,
  codechefStarsFromRating,
  normalizeGfgInfo,
  parseGfgProfilePage,
  SourceError,
} from '../js/profile-sources.mjs';

const pad = '<!-- -->'.repeat(40);

test('sanitizeProfile coerces, rejects junk and requires a headline stat', () => {
  const out = sanitizeProfile('codechef', { handle: ' sumitx ', rating: '2,012', stars: 5, globalRank: 'Inactive', countryRank: -4, solved: NaN, extra: 1 });
  assert.deepEqual(out, { handle: 'sumitx', rating: 2012, maxRating: null, stars: 5, globalRank: null, countryRank: null, solved: null });
  assert.throws(() => sanitizeProfile('codechef', { handle: 'x', solved: 10 }), SourceError);
  assert.throws(() => sanitizeProfile('codeforces', null), SourceError);
  assert.throws(() => sanitizeProfile('nope', {}), SourceError);
});

test('Codeforces: unique accepted problems, history, missing pieces degrade to null', () => {
  const subs = [
    { verdict: 'OK', problem: { contestId: 1, index: 'A' } },
    { verdict: 'OK', problem: { contestId: 1, index: 'A' } },
    { verdict: 'WRONG_ANSWER', problem: { contestId: 1, index: 'B' } },
    { verdict: 'OK', problem: { contestId: 2, index: 'A' } },
    { verdict: 'OK' },
  ];
  assert.equal(countCodeforcesSolved(subs), 2);

  const info = [{ handle: 'SumitXorY', rating: 1777, maxRating: 1888, rank: 'expert', maxRank: 'candidate master' }];
  const history = [
    { contestName: 'Round A', rank: 10, oldRating: 1700, newRating: 1750 },
    { contestName: 'Round B', rank: 20, oldRating: 1750, newRating: 1720 },
  ];
  const d = sanitizeProfile('codeforces', normalizeCodeforces(info, history, subs));
  assert.equal(d.rating, 1777);
  assert.equal(d.solved, 2);
  assert.equal(d.contestCount, 2);
  assert.deepEqual(d.recentContests[0], { name: 'Round B', rank: 20, newRating: 1720, delta: -30 });

  const partial = sanitizeProfile('codeforces', normalizeCodeforces(info, null, null));
  assert.equal(partial.solved, null);
  assert.equal(partial.contestCount, null);
  assert.throws(() => normalizeCodeforces([], null, null), SourceError);
});

test('LeetCode GraphQL + alfa wrapper normalise to the same shape', () => {
  const body = { data: {
    matchedUser: { username: 'sumit_chauhan_', submitStatsGlobal: { acSubmissionNum: [
      { difficulty: 'All', count: 600 }, { difficulty: 'Easy', count: 150 }, { difficulty: 'Medium', count: 350 }, { difficulty: 'Hard', count: 100 },
    ] } },
    userContestRanking: { attendedContestsCount: 42, rating: 1876.6, globalRanking: 23456, topPercentage: 4.813, badge: { name: 'Knight' } },
  } };
  const a = sanitizeProfile('leetcode', normalizeLeetCodeGraphQL(body, 'sumit_chauhan_'));
  assert.equal(a.rating, 1877);
  assert.equal(a.solved, 600);
  assert.equal(a.badge, 'Knight');
  assert.equal(a.topPercentage, 4.81);

  const noContests = sanitizeProfile('leetcode', normalizeLeetCodeGraphQL({ data: { ...body.data, userContestRanking: null } }, 'x'));
  assert.equal(noContests.rating, null);
  assert.equal(noContests.solved, 600);

  assert.throws(() => normalizeLeetCodeGraphQL({ data: { matchedUser: null }, errors: [{ message: 'That user does not exist.' }] }), /does not exist/);

  const b = sanitizeProfile('leetcode', normalizeLeetCodeAlfa(
    { solvedProblem: 600, easySolved: 150, mediumSolved: 350, hardSolved: 100 },
    { contestAttend: 42, contestRating: 1876.6, contestGlobalRanking: 23456, contestTopPercentage: 4.81, contestBadges: { name: 'Knight' } },
    'sumit_chauhan_',
  ));
  assert.deepEqual({ ...b }, { ...a, topPercentage: 4.81 });
});

test('CodeChef profile page parsing', () => {
  const html = `<div class="rating-number">2012?</div>
    <div class="rating-star"><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span><span>&#9733;</span></div>
    <small>(Highest Rating 2050)</small>
    <div class="rating-ranks"><ul class="inline-list">
      <li><a href="/ratings/all"><strong>1,234</strong></a> Global Rank</li>
      <li><a href="/ratings/all?filterBy=Country%3DIndia"><strong>567</strong></a> Country Rank</li>
    </ul></div>
    <h3>Total Problems Solved: 210</h3>${pad}`;
  assert.deepEqual(parseCodeChefProfile(html, 'sumitx'), {
    handle: 'sumitx', rating: 2012, maxRating: 2050, stars: 5, globalRank: 1234, countryRank: 567, solved: 210,
  });

  // Inactive ranks + no star markup: ranks become null, stars come from the live rating.
  const sparse = `<div class="rating-number">1650</div><div class="rating-ranks"><ul>
    <li><strong>Inactive</strong> Global Rank</li><li><strong>Inactive</strong> Country Rank</li></ul></div>${pad}`;
  const d = parseCodeChefProfile(sparse, 'sumitx');
  assert.equal(d.stars, 3);
  assert.equal(d.globalRank, null);
  assert.equal(d.solved, null);

  assert.throws(() => parseCodeChefProfile(`<html>${pad}</html>`), SourceError);
  assert.throws(() => parseCodeChefProfile(''), SourceError);
  assert.deepEqual([1399, 1400, 1799, 2000, 2199, 2200, 2500].map(codechefStarsFromRating), [1, 2, 3, 5, 5, 6, 7]);
});

test('GeeksforGeeks: JSON API, __NEXT_DATA__ and visible-text fallbacks', () => {
  const info = { score: 1234, total_problems_solved: 400, institute_rank: 99, institute_name: 'NIT Jalandhar', pod_solved_longest_streak: 120 };
  const expected = { handle: 'h', score: 1234, solved: 400, instituteRank: 99, institute: 'NIT Jalandhar', longestStreak: 120 };
  assert.deepEqual(normalizeGfgInfo(info, 'h'), expected);
  assert.throws(() => normalizeGfgInfo(undefined, 'h'), SourceError);

  const next = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { userInfo: info } } })}</script>${pad}`;
  assert.deepEqual(parseGfgProfilePage(next, 'h'), expected);

  const text = `<div>Coding Score</div><div>1,234</div><div>Problem Solved</div><div>400</div><div>Institute Rank</div><div>99</div>${pad}`;
  const t = parseGfgProfilePage(text, 'h');
  assert.equal(t.score, 1234);
  assert.equal(t.solved, 400);
  assert.equal(t.instituteRank, 99);

  assert.throws(() => parseGfgProfilePage(`<p>nothing</p>${pad}`, 'h'), SourceError);
});

test('Netlify function: routing, caching headers and failure mode', async () => {
  const realFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url) => {
    calls++;
    const u = new URL(String(url));
    if (u.hostname === 'authapi.geeksforgeeks.org') {
      return new Response(JSON.stringify({ data: { score: 10, total_problems_solved: 5 } }), { status: 200 });
    }
    throw new TypeError('fetch failed');
  };
  try {
    const { default: handler, config } = await import('../netlify/functions/profiles.mjs');
    assert.equal(config.path, '/api/profiles/:platform');

    const unknown = await handler(new Request('http://x/api/profiles/nope'), { params: { platform: 'nope' } });
    assert.equal(unknown.status, 404);

    const ok = await handler(new Request('http://x/api/profiles/geeksforgeeks'), { params: { platform: 'geeksforgeeks' } });
    assert.equal(ok.status, 200);
    assert.match(ok.headers.get('netlify-cdn-cache-control'), /s-maxage=\d+/);
    const body = await ok.json();
    assert.equal(body.ok, true);
    assert.equal(body.data.score, 10);
    assert.ok(!Number.isNaN(Date.parse(body.fetchedAt)));

    // Served from the warm cache: no second upstream call.
    const before = calls;
    await handler(new Request('http://x/api/profiles/geeksforgeeks'), { params: { platform: 'geeksforgeeks' } });
    assert.equal(calls, before);

    const down = await handler(new Request('http://x/api/profiles/codechef'), { params: { platform: 'codechef' } });
    assert.equal(down.status, 502);
    assert.equal(down.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await down.json(), { ok: false, platform: 'codechef', error: 'upstream_unavailable' });
  } finally {
    globalThis.fetch = realFetch;
  }
});
