import { Metadata } from "next";
import Link from "next/link";
import { validLocales } from '@/lib/i18n/getLocale';
import koMessages from '@/locales/ko.json';
import enMessages from '@/locales/en.json';

export function generateStaticParams() {
  return validLocales.map((locale) => ({
    locale,
  }));
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: locale === 'ko' 
      ? '개인정보처리방침 - AtSignal' 
      : 'Privacy Policy - AtSignal',
    description: locale === 'ko'
      ? 'AtSignal 개인정보처리방침'
      : 'AtSignal Privacy Policy',
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;

  const translations = {
    ko: koMessages,
    en: enMessages,
  } as const;

  const t = translations[locale as keyof typeof translations]?.privacy ?? translations.ko.privacy;

  // 한국어 콘텐츠
  const koContent = {
    title: '개인정보처리방침',
    intro: '엣시그널은 개인정보보호법에 따라 수집하는 개인정보의 항목, 개인정보의 수집 및 이용목적, 개인정보의 보유 및 이용기간, 개인정보의 파기절차 및 방법에 관한 사항을 규정합니다.',
    lastUpdated: '최종 업데이트: 2025년 00월 00일',
    sections: [
      {
        title: '수집하는 개인정보',
        content: '엣시그널은 뉴스레터 서비스를 위해 다음과 같은 개인정보를 수집합니다.',
        items: [
          '성함',
          '소속/회사명',
          '이메일 주소',
          '휴대폰 번호',
        ],
      },
      {
        title: '개인정보의 수집 및 이용 목적',
        content: '엣시그널은 다음과 같은 목적으로 개인정보를 이용합니다.',
        items: [
          'AI 뉴스 다이제스트 뉴스레터 발송',
          '서비스 관련 공지 및 중요 정보 안내',
          '개인화된 서비스 제공',
        ],
      },
      {
        title: '개인정보의 보유 및 이용 기간',
        content: '수집한 개인정보는 서비스 제공 목적 달성을 위해 필요한 기간 동안 보유 및 이용됩니다.',
        subContent: '다음의 경우 해당 개인정보를 파기합니다.',
        items: [
          '이용자의 뉴스레터 구독 해지 요청 시',
          '이용자의 개인정보 삭제 요청 시',
          '서비스 종료 시',
        ],
      },
      {
        title: '개인정보의 보호조치',
        content: '엣시그널은 이용자의 개인정보를 보호하기 위해 다음과 같은 조치를 취하고 있습니다.',
        items: [
          'SSL 암호화 통신',
          '접근 제어 및 권한 관리',
          '정기적인 보안 업데이트 및 취약점 점검',
          '개인정보 처리 시스템 접근 기록 관리',
        ],
      },
      {
        title: '개인정보의 제3자 제공',
        content: '엣시그널은 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.',
        subContent: '다만, 다음의 경우에는 예외로 합니다:',
        items: [
          '법령에 의해 요구되는 경우',
          '이용자의 사전 동의가 있는 경우',
          '서비스 제공을 위해 위탁업체(뉴스레터 발송 서비스 등)에 제공하는 경우',
        ],
      },
      {
        title: '이용자의 권리',
        content: '이용자는 개인정보에 대해 다음과 같은 권리를 가집니다.',
        items: [
          '개인정보 열람 요구',
          '개인정보 정정·삭제 요구',
          '개인정보 처리정지 요구',
          '개인정보의 이용 및 제공에 대한 동의 철회',
        ],
        footer: '위 권리를 행사하려면 info@atsignal.io로 이메일을 보내주세요.',
      },
      {
        title: '개인정보 관리 책임자',
        items: [
          '이름: 아무개',
          '직책: 최고 기술 관리자',
          '이메일: info@atsignal.io',
        ],
      },
      {
        title: '개인정보처리방침 변경',
        content: '이 개인정보처리방침은 법령 및 방침에 따라 변경될 수 있으며, 변경 시에는 웹사이트 또는 이메일을 통해 공지합니다.',
      },
      {
        title: '개인정보 관련 문의',
        content: '개인정보 보호에 관한 문의사항이 있으시면 언제든지 연락주세요.',
        footer: 'info@atsignal.io',
      },
    ],
  };

  // 영어 콘텐츠 (기본 구조만 제공, 나중에 번역 가능)
  const enContent = {
    title: 'Privacy Policy',
    intro: 'AtSignal establishes provisions regarding the items of personal information collected, the purpose of collection and use of personal information, the retention and use period of personal information, and the procedures and methods for destruction of personal information in accordance with the Personal Information Protection Act.',
    lastUpdated: 'Last Updated: January 00, 2025',
    sections: [
      {
        title: 'Personal Information Collected',
        content: 'AtSignal collects the following personal information for newsletter services.',
        items: [
          'Name',
          'Company/Organization',
          'Email Address',
          'Phone Number',
        ],
      },
      {
        title: 'Purpose of Collection and Use of Personal Information',
        content: 'AtSignal uses personal information for the following purposes.',
        items: [
          'Sending AI News Digest Newsletter',
          'Service-related notices and important information',
          'Providing personalized services',
        ],
      },
      {
        title: 'Retention and Use Period of Personal Information',
        content: 'Collected personal information is retained and used for the period necessary to achieve the purpose of providing services.',
        subContent: 'Personal information is destroyed in the following cases:',
        items: [
          'When the user requests cancellation of newsletter subscription',
          'When the user requests deletion of personal information',
          'When the service is terminated',
        ],
      },
      {
        title: 'Measures for Protection of Personal Information',
        content: 'AtSignal takes the following measures to protect users\' personal information.',
        items: [
          'SSL encrypted communication',
          'Access control and permission management',
          'Regular security updates and vulnerability checks',
          'Management of access records to personal information processing systems',
        ],
      },
      {
        title: 'Provision of Personal Information to Third Parties',
        content: 'AtSignal does not provide personal information to third parties without the user\'s consent.',
        subContent: 'However, exceptions are made in the following cases:',
        items: [
          'When required by law',
          'When the user has given prior consent',
          'When provided to contractors (newsletter delivery services, etc.) for service provision',
        ],
      },
      {
        title: 'User Rights',
        content: 'Users have the following rights regarding personal information.',
        items: [
          'Request to access personal information',
          'Request to correct or delete personal information',
          'Request to suspend processing of personal information',
          'Withdraw consent for use and provision of personal information',
        ],
        footer: 'To exercise these rights, please send an email to info@atsignal.io.',
      },
      {
        title: 'Personal Information Protection Officer',
        items: [
          'Name: [Name]',
          'Position: Chief Technology Officer',
          'Email: info@atsignal.io',
        ],
      },
      {
        title: 'Changes to Privacy Policy',
        content: 'This privacy policy may be changed in accordance with laws and policies, and when changed, it will be announced through the website or email.',
      },
      {
        title: 'Inquiries Regarding Personal Information',
        content: 'If you have any questions about personal information protection, please contact us at any time.',
        footer: 'info@atsignal.io',
      },
    ],
  };

  const content = locale === 'ko' ? koContent : enContent;

  return (
    <div className="main dark-mode">
      {/* Privacy Policy Section */}
      <section className="section section-white">
        <div className="section-container">
          <div className="privacy-page">
            {/* Breadcrumb */}
            <nav className="privacy-breadcrumb" aria-label="Breadcrumb">
              <Link href={`/${locale}`} className="breadcrumb-link">
                {t.home || (locale === 'ko' ? '홈' : 'Home')}
              </Link>
              <span className="breadcrumb-separator">|</span>
              <span className="breadcrumb-current">
                {content.title}
              </span>
            </nav>

            {/* Title */}
            <h1 className="privacy-title">{content.title}</h1>
            <p className="privacy-intro">{content.intro}</p>
            <p className="privacy-updated">{content.lastUpdated}</p>

            {/* Sections */}
            <div className="privacy-sections">
              {content.sections.map((section, index) => (
                <div key={index} className="privacy-section">
                  <h2 className="privacy-section-title">{section.title}</h2>
                  {section.content && (
                    <p className="privacy-section-content">{section.content}</p>
                  )}
                  {section.subContent && (
                    <p className="privacy-section-subcontent">{section.subContent}</p>
                  )}
                  {section.items && section.items.length > 0 && (
                    <ul className="privacy-list">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="privacy-list-item">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.footer && (
                    <p className="privacy-section-footer">{section.footer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

