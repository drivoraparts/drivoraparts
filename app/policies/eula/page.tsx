import Policy from "@/components/policy/Policy";

export default function EULAPage() {
  return (
    <Policy
      title="End User License Agreement"
      intro="This End User License Agreement (“EULA”) is a legal agreement between you and DrivoraParts LLC (“Company”, “we”, “us”) that governs your access to and use of the website, software, and digital content made available through our services (the “Services”). By accessing or using the Services, you agree to be bound by this EULA. If you do not agree to these terms, you must not access or use the Services."
      sections={[
        {
          heading: "License Grant",
          paragraphs: [
            "Subject to your compliance with this EULA, DrivoraParts LLC grants you a limited, non-exclusive, non-transferable, non-sublicensable, and revocable license to access and use the website and its digital content for your personal, non-commercial purposes in connection with browsing and purchasing products.",
          ],
        },
        {
          heading: "Scope of the License",
          paragraphs: [
            "This license permits you to view and interact with the Services as an end user. It does not grant you any rights to the underlying software, source code, design, or systems, and it does not permit any commercial exploitation of the Services or their content.",
          ],
        },
        {
          heading: "Intellectual Property and Ownership",
          paragraphs: [
            "The Services and all associated materials, including software, source code, design, layout, structure, graphics, logos, images, and text, are owned by DrivoraParts LLC or its licensors and are protected by intellectual property laws. All rights not expressly granted to you under this EULA are reserved by DrivoraParts LLC.",
          ],
        },
        {
          heading: "Restrictions",
          paragraphs: [
            "Except as expressly permitted by this EULA or applicable law, you agree that you will not do any of the following:",
          ],
          bullets: [
            "Copy, reproduce, replicate, or imitate the design, layout, or appearance of the Services.",
            "Redistribute, republish, sell, rent, lease, or sublicense any content from the Services.",
            "Modify, adapt, translate, or create derivative works based on the Services or their content.",
            "Reverse engineer, decompile, or disassemble any software or attempt to derive its source code.",
            "Remove, obscure, or alter any copyright, trademark, or other proprietary notices.",
          ],
        },
        {
          heading: "Acceptable Use",
          paragraphs: [
            "Your use of the Services under this license must comply with our Acceptable Use Policy and Terms of Service. Any use of the Services outside the scope of the license granted here is strictly prohibited and may constitute infringement of our intellectual property rights.",
          ],
        },
        {
          heading: "Updates and Modifications",
          paragraphs: [
            "We may update, modify, suspend, or discontinue the Services or any part of this EULA at any time, with or without notice. Your continued use of the Services after changes take effect constitutes acceptance of the revised terms.",
          ],
        },
        {
          heading: "Termination",
          paragraphs: [
            "This license is effective until terminated. It will terminate automatically and without notice if you fail to comply with any provision of this EULA. We may also suspend or terminate your license at any time. Upon termination, you must immediately cease all use of the Services and destroy any copies of content obtained from them.",
          ],
        },
        {
          heading: "Disclaimer of Warranties",
          paragraphs: [
            "The Services are provided on an “as-is” and “as-available” basis, without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement, to the maximum extent permitted by law.",
          ],
        },
        {
          heading: "Limitation of Liability",
          paragraphs: [
            "To the maximum extent permitted by applicable law, DrivoraParts LLC shall not be liable for any damages arising from your use of, or inability to use, the Services, including direct, indirect, incidental, or consequential damages.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "For questions regarding this EULA, contact DrivoraParts LLC at support@drivoraparts.com.",
          ],
        },
      ]}
    />
  );
}
