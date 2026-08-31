import React from "react";
import Link from "@docusaurus/Link";
import styles from "./styles.module.css";

/**
 * Author bio block rendered at the foot of every blog post.
 *
 * Content comes from blog/authors.yml — the `description` field is the bio, and
 * `socials` supplies the links. Adding a new author there is all that is needed;
 * nothing here has to change.
 *
 * Named, attributable authors are a search quality signal and are the main way
 * LLMs decide whose claims to repeat, so this renders for every post.
 */
function Social({ platform, handle }) {
  const hrefs = {
    github: (h) => `https://github.com/${h}`,
    linkedin: (h) => `https://www.linkedin.com/in/${h}`,
    x: (h) => `https://x.com/${h}`,
    twitter: (h) => `https://x.com/${h}`,
    bluesky: (h) => `https://bsky.app/profile/${h}`,
    mastodon: (h) => h,
  };
  if (!handle) return null;
  // Absolute URLs are used as-is; bare handles are expanded per platform.
  const href = /^https?:\/\//.test(handle)
    ? handle
    : (hrefs[platform] ?? ((h) => h))(handle);
  return (
    <Link className={styles.social} to={href} rel="noopener">
      {platform}
    </Link>
  );
}

export default function AuthorBio({ authors }) {
  const withBios = (authors ?? []).filter((a) => a?.description);
  if (withBios.length === 0) return null;

  return (
    <aside className={styles.wrapper} aria-label="About the author">
      {withBios.map((author) => {
        const image = author.imageURL ?? author.image_url;
        const profile = author.page?.permalink ?? author.url;
        return (
          <div className={styles.author} key={author.key ?? author.name}>
            {image && (
              <img
                className={styles.avatar}
                src={image}
                alt={author.name}
                width={64}
                height={64}
                loading="lazy"
              />
            )}
            <div className={styles.body}>
              <div className={styles.name}>
                {profile ? (
                  <Link to={profile}>{author.name}</Link>
                ) : (
                  author.name
                )}
                {author.title && (
                  <span className={styles.title}> · {author.title}</span>
                )}
              </div>
              <p className={styles.description}>{author.description}</p>
              {author.socials && (
                <div className={styles.socials}>
                  {Object.entries(author.socials).map(([platform, handle]) => (
                    <Social key={platform} platform={platform} handle={handle} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
