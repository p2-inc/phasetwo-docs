import Link from "@docusaurus/Link";

export default function StartYourJourney() {
  return (
    <div 
      className="keycloak-start-your-journey w-full"
      style={{
        backgroundImage: 'url(/img/pattern-plus.svg)',
        backgroundRepeat: 'repeat',
        paddingTop: '100px',
        paddingBottom: '100px',
        borderTop: '1px solid var(--line-color)',
      }}
    >
      <div className="mx-auto max-w-[880px] px-6 text-center">
        <h3 className="text-white mb-10">
          Wherever you are in your Keycloak or Authentication journey, Phase Two is here to help from Hosting to Support. We can help your team get successful, saving you time and money.
        </h3>
        <div className="flex items-center justify-center">
          <Link
            href="/contact"
            className="btnPrimary btnUltraLarge btnInverted"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
