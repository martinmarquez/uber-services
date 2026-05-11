drop trigger if exists trg_set_updated_at_review_aggregates on review_aggregates;
drop function if exists set_updated_at_review_aggregates;

drop table if exists review_reports;
drop table if exists review_tags;
drop table if exists review_aggregates;
