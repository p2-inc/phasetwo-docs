import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import ReactTextRotator from 'react-text-rotator';

const features = [
  {
    title: <>Easy to Use</>,
    description: (
      <>
        Phase Two was designed to be easily integrated into an existing application or
      used as the structure for your new application, so you can get up and running quickly.
      </>
    ),
  },
  {
    title: <>Focus on What Matters</>,
    description: (
      <>
        Phase Two lets you focus on your competitive advantage, not the functionality common
      to all SaaS services. Let us take care of the chores so you can work on realizing your dream.
      </>
    ),
  },
  {
    title: <>Pricing Transparency</>,
    description: (
      <>
        Unlike the labyrinth of different rate cards out that that nickel and dime for each feature
      and user, Phase Two is one price per project. No hidden fees, no unpredictable costs.
      </>
    ),
  },
];

const rotatingFeatures = [
  {
    text: 'Authorization',
    className: styles.heroProjectKeywords
  },      
  {
    text: 'Authentication',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Role-based Access Control',
    className: styles.heroProjectKeywords
  },
  {
    text: 'SAML SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'OpenId SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'LDAP SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Active Directory SSO',
    className: styles.heroProjectKeywords
  },
  {
    text: 'OAuth Connections',
    className: styles.heroProjectKeywords
  },
  {
    text: 'an Identity Provider',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Permissions',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Organizations',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Teams',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Invitations',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Audit Logs',
    className: styles.heroProjectKeywords
  },
  {
    text: 'Access Auditing',
    className: styles.heroProjectKeywords
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Tools for SaaS builders">
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroProjectTagline}>
      Phase Two gives you {' '}<br/>
      <ReactTextRotator
        content={rotatingFeatures}
        time={2000}
        startDelay={0}
      />{' '}<br/>
      so you can focus on <span className={styles.heroProjectKeywords}>your app</span>.
          </h1>
          <div className={styles.indexCtas}>
            <Link
              className={styles.indexCtasGetStartedButton}
              to={useBaseUrl('docs/introduction')}>
              Get Started
            </Link>
          </div>
        </div>
      </div>
      <div className={classnames(styles.announcement, styles.announcementDark)}>
        <div className={styles.announcementInner}>
          Coming from v1? Check out our{' '}
          <Link to={useBaseUrl('/docs/migrating-from-v1-to-v2')}>
            v1 to v2 migration guide
          </Link>
          .
        </div>
      </div>


      <main>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
