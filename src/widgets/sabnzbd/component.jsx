import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import HistoryEntry from "components/widgets/history/historyEntry";
import QueueEntry from "components/widgets/queue/queueEntry";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

function getProgress(sizeLeft, size) {
  return sizeLeft === 0 ? 100 : (1 - sizeLeft / size) * 100;
}

function fromUnits(value) {
  const units = ["B", "K", "M", "G", "T", "P"];
  const [number, unit] = value.split(" ");
  const index = units.indexOf(unit);
  if (index === -1) {
    return 0;
  }
  return parseFloat(number) * 1024 ** index;
}

const defaultLimit = 5;

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const enableQueue = !!widget?.enableQueue; // default false
  const enableHistory = !!widget?.enableHistory; // default false

  const options = {
    limit: widget?.limit ? widget.limit : defaultLimit,
  };

  // call the widget api with options
  // avoids lint error
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue", options);
  const { data: historyData, error: historyError } = useWidgetAPI(widget, "history", options);

  if (queueError) {
    return <Container service={service} error={queueError} />;
  }

  if (historyError) {
    return <Container service={service} error={historyError} />;
  }

  if (!queueData) {
    return (
      <Container service={service}>
        <Block label="sabnzbd.rate" />
        <Block label="sabnzbd.queue" />
        <Block label="sabnzbd.timeleft" />
      </Container>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="sabnzbd.rate" value={t("common.byterate", { value: fromUnits(queueData.queue.speed) })} />
        <Block label="sabnzbd.queue" value={t("common.number", { value: queueData.queue.noofslots })} />
        <Block label="sabnzbd.timeleft" value={queueData.queue.timeleft} />
      </Container>
      {enableQueue &&
        queueData?.queue?.slots?.map((slot) => (
          <QueueEntry
            progress={getProgress(slot.mbleft, slot.mb)}
            timeLeft={slot.timeleft}
            title={slot.filename} // title={`Placeholder Title ${slot.index}`}
            activity={slot.percentage === "0" ? "Queued" : slot.status}
            key={slot.nzo_id}
          />
        ))}

      {/* line separator for queue and history */}
      {enableHistory && historyData?.history?.slots?.length > 0 && (
        <div className="my-2 mx-auto h-px bg-theme-300 dark:bg-theme-700 w-5/6" />
      )}

      {enableHistory &&
        historyData?.history?.slots?.map((slot) => (
          <HistoryEntry title={slot.name} activity={slot.status} key={slot.nzo_id} />
        ))}
    </>
  );
}
