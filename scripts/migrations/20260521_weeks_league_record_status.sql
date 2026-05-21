-- weeks 테이블에 weekly 리그 기록 상태 컬럼 추가.
-- '대전 중' / '대전 집계' 는 시각만으로 도출 가능하므로 NULL 로 두고,
-- 운영자가 매니징에서 '공표 중' / '검수 완료' 를 수동 토글한 시점에만 값을 채워 넣는다.

ALTER TABLE public.weeks
  ADD COLUMN IF NOT EXISTS league_record_status text
    CHECK (league_record_status IN ('대전 중', '대전 집계', '공표 중', '검수 완료')),
  ADD COLUMN IF NOT EXISTS announced_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at  timestamptz;

COMMENT ON COLUMN public.weeks.league_record_status IS
  '리그 기록 상태. NULL=시각 기준 자동 도출(대전 중/대전 집계). 운영자가 수동 토글하면 공표 중/검수 완료가 직접 들어감.';
COMMENT ON COLUMN public.weeks.announced_at IS '공표 중 전환 시각(KST). pms1.5 어드민 토글 시점.';
COMMENT ON COLUMN public.weeks.reviewed_at  IS '검수 완료 전환 시각(KST). pms1.5 어드민 토글 시점.';

-- Backfill: 이미 운영상 검수까지 마무리된 과거 주차들을 일괄로 '검수 완료' 로 채움.
-- 기준: end_date + 5일 14:00 KST 가 현재 시점보다 과거 = 이미 검수 마감 시각이 지났다는 뜻.
-- 신규 컬럼 도입 이전부터 운영 중이던 주차들은 모두 이 조건에 해당하므로 일괄 처리.
UPDATE public.weeks
SET league_record_status = '검수 완료',
    reviewed_at          = now()
WHERE league_record_status IS NULL
  AND ((end_date + interval '5 days')::timestamp + interval '14 hours') AT TIME ZONE 'Asia/Seoul' < now();
